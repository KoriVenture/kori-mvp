import { NextResponse } from "next/server";
import { investorPatchSchema } from "@/lib/validation/investor-onboarding";
import { invalid, requireRole } from "@/lib/onboarding/http";

export async function GET() {
  const auth = await requireRole("investor"); if (auth.error) return auth.error;
  const { supabase, userId } = auth;
  const [user, profile, investor, progress, agreements] = await Promise.all([
    supabase.from("users").select("email,role,verification_status").eq("id",userId).single(),
    supabase.from("user_profiles").select("*").eq("user_id",userId).single(),
    supabase.from("investor_profiles").select("*").eq("user_id",userId).single(),
    supabase.from("onboarding_progress").select("*").eq("user_id",userId).single(),
    supabase.from("agreement_acceptances").select("*").eq("user_id",userId),
  ]);
  return NextResponse.json({ user:user.data, profile:profile.data, investor:investor.data, progress:progress.data, agreements:agreements.data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireRole("investor"); if (auth.error) return auth.error;
  const parsed = investorPatchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return invalid(parsed.error.flatten());
  const { supabase, userId } = auth; const p = parsed.data;
  if (p.profile) { const x=p.profile; const { error }=await supabase.from("user_profiles").upsert({user_id:userId,legal_first_name:x.legalFirstName,legal_last_name:x.legalLastName,country:x.country,city:x.city,timezone:x.timezone,linkedin_url:x.linkedinUrl,professional_title:x.professionalTitle,organization:x.organization,biography:x.biography,photo_path:x.photoPath,languages:x.languages,updated_at:new Date().toISOString()}); if(error) return NextResponse.json({error:"Unable to save profile."},{status:500}); }
  if (p.preferences || p.eligibility || p.complete) { const x=p.preferences, e=p.eligibility; const row:Record<string,unknown>={user_id:userId,updated_at:new Date().toISOString()}; if(x) Object.assign(row,{investor_type:x.investorType,expertise_areas:x.expertiseAreas,ask_me_about:x.askMeAbout,preferred_regions:x.preferredRegions,investment_stages:x.investmentStages,preferred_ticket_size:x.preferredTicketSize,preferred_instruments:x.preferredInstruments,investment_horizon:x.investmentHorizon,investment_thesis:x.investmentThesis}); if(e) Object.assign(row,{investor_classification:e.investorClassification,experience:e.investmentExperience,private_company_experience:e.privateCompanyExperience,source_of_funds:e.sourceOfFunds,risk_acknowledged:e.riskAcknowledged}); if(p.complete) Object.assign(row,{onboarding_status:"completed",completed_at:new Date().toISOString()}); const {error}=await supabase.from("investor_profiles").upsert(row); if(error) return NextResponse.json({error:"Unable to save investor profile."},{status:500}); }
  if (p.agreements) for (const type of ["terms","privacy","platform","investment_risk"]) await supabase.from("agreement_acceptances").upsert({user_id:userId,agreement_type:type,agreement_version:"mvp-1",accepted:true,signature_name:p.agreements.signatureName,signed_at:p.agreements.signedAt},{onConflict:"user_id,agreement_type,agreement_version"});
  await supabase.from("users").update({verification_status:"deferred",updated_at:new Date().toISOString()}).eq("id",userId);
  await supabase.from("onboarding_progress").upsert({user_id:userId,flow_type:"investor",current_screen:p.screen,completed_screens:Array.from({length:p.screen},(_,i)=>i),last_saved_at:new Date().toISOString()});
  return NextResponse.json({ ok:true });
}
