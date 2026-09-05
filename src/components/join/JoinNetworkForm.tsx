"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  country: string;
  linkedin: string;
  interest: string;
  consent: boolean;
};

type FieldName = keyof FormValues;
type FormErrors = Record<FieldName, string>;

type FormStatus = {
  className: string;
  content: ReactNode;
};

const INITIAL_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  country: "",
  linkedin: "",
  interest: "",
  consent: false,
};

const INITIAL_ERRORS: FormErrors = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  country: "",
  linkedin: "",
  interest: "",
  consent: "",
};

const ROLES = [
  "founder",
  "investor",
  "community",
  "expert",
  "partner",
  "other",
] as const;

export function JoinNetworkForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>({
    className: "form-status",
    content: null,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const roleFromHash = window.location.hash.replace("#", "");
      if (ROLES.some((role) => role === roleFromHash)) {
        setValues((current) => ({ ...current, role: roleFromHash }));
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateText =
    (field: Exclude<FieldName, "consent">) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const validate = () => {
    const form = formRef.current;
    const email = form?.elements.namedItem("email") as HTMLInputElement | null;
    const linkedin = form?.elements.namedItem(
      "linkedin",
    ) as HTMLInputElement | null;
    const nextErrors: FormErrors = { ...INITIAL_ERRORS };

    nextErrors.firstName = values.firstName.trim()
      ? ""
      : "This field is required.";
    nextErrors.lastName = values.lastName.trim()
      ? ""
      : "This field is required.";
    nextErrors.country = values.country.trim()
      ? ""
      : "This field is required.";
    nextErrors.email = !values.email.trim()
      ? "Enter your email address."
      : email?.validity.valid
        ? ""
        : "Enter a valid email address.";
    nextErrors.role = values.role
      ? ""
      : "Select the role closest to yours.";
    nextErrors.linkedin =
      !values.linkedin || linkedin?.validity.valid
        ? ""
        : "Enter a complete URL beginning with https://";
    nextErrors.consent = values.consent
      ? ""
      : "Consent is required before submitting.";

    flushSync(() => setErrors(nextErrors));
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleBlur = (
    event: FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    if (event.currentTarget.getAttribute("aria-invalid") === "true") {
      validate();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form || !validate()) {
      form
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      setStatus({
        className: "form-status form-status--error",
        content: "Review the highlighted fields before continuing.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({
      className: "form-status form-status--notice",
      content: "Sending your information securely…",
    });

    const payload = {
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      country: values.country.trim(),
      linkedin: values.linkedin.trim() || null,
      interest: values.interest.trim() || null,
      consent: true,
    };

    try {
      const response = await fetch("/api/waiting-list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

      form.reset();
      setValues(INITIAL_VALUES);
      setErrors(INITIAL_ERRORS);
      setStatus({
        className: "form-status form-status--success",
        content: (
          <>
            <strong>Thank you for joining the Kori network.</strong>
            <span>Your information was submitted successfully. We’ll be in touch when there is a relevant next step.</span>
          </>
        ),
      });
    } catch (error) {
      console.error("Kori waiting-list submission failed:", error);
      setStatus({
        className: "form-status form-status--error",
        content: (
          <>
            <strong>We could not submit your information.</strong>
            <span>Please try again shortly. If the problem continues, contact Kori directly.</span>
          </>
        ),
      });
    } finally {
      setSubmitting(false);
      statusRef.current?.focus();
    }
  };

  return (
    <form
      className="network-form"
      id="network-form"
      noValidate
      ref={formRef}
      onSubmit={handleSubmit}
    >
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="first-name">
            First name <span aria-hidden="true">*</span>
          </label>
          <input
            id="first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={values.firstName}
            onChange={updateText("firstName")}
            onBlur={handleBlur}
            aria-invalid={errors.firstName ? "true" : "false"}
            aria-describedby="first-name-error"
          />
          <p className="field-error" id="first-name-error" aria-live="polite">
            {errors.firstName}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="last-name">
            Last name <span aria-hidden="true">*</span>
          </label>
          <input
            id="last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={values.lastName}
            onChange={updateText("lastName")}
            onBlur={handleBlur}
            aria-invalid={errors.lastName ? "true" : "false"}
            aria-describedby="last-name-error"
          />
          <p className="field-error" id="last-name-error" aria-live="polite">
            {errors.lastName}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="email">
            Email address <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={updateText("email")}
            onBlur={handleBlur}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-helper email-error"
          />
          <p className="field-helper" id="email-helper">
            Use the address where Kori should contact you.
          </p>
          <p className="field-error" id="email-error" aria-live="polite">
            {errors.email}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="role">
            I am joining as <span aria-hidden="true">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            value={values.role}
            onChange={updateText("role")}
            onBlur={handleBlur}
            aria-invalid={errors.role ? "true" : "false"}
            aria-describedby="role-error"
          >
            <option value="">Select your role</option>
            <option value="founder">Founder</option>
            <option value="investor">Investor</option>
            <option value="community">Community lead</option>
            <option value="expert">Expert or operator</option>
            <option value="partner">Ecosystem partner</option>
            <option value="other">Other</option>
          </select>
          <p className="field-error" id="role-error" aria-live="polite">
            {errors.role}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="country">
            Country <span aria-hidden="true">*</span>
          </label>
          <input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            required
            value={values.country}
            onChange={updateText("country")}
            onBlur={handleBlur}
            aria-invalid={errors.country ? "true" : "false"}
            aria-describedby="country-error"
          />
          <p className="field-error" id="country-error" aria-live="polite">
            {errors.country}
          </p>
        </div>

        <div className="form-field form-field--wide">
          <label htmlFor="linkedin">
            LinkedIn profile <span className="optional">Optional</span>
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            inputMode="url"
            placeholder="https://www.linkedin.com/in/…"
            value={values.linkedin}
            onChange={updateText("linkedin")}
            onBlur={handleBlur}
            aria-invalid={errors.linkedin ? "true" : "false"}
            aria-describedby="linkedin-error"
          />
          <p className="field-error" id="linkedin-error" aria-live="polite">
            {errors.linkedin}
          </p>
        </div>

        <div className="form-field form-field--wide">
          <label htmlFor="interest">
            What brings you to Kori?{" "}
            <span className="optional">Optional</span>
          </label>
          <textarea
            id="interest"
            name="interest"
            rows={6}
            maxLength={800}
            value={values.interest}
            onChange={updateText("interest")}
            onBlur={handleBlur}
            aria-invalid={errors.interest ? "true" : "false"}
            aria-describedby="interest-helper interest-error"
          />
          <div className="textarea-meta">
            <p className="field-helper" id="interest-helper">
              Tell us what you want to invest in, build, understand or
              contribute.
            </p>
            <span id="interest-count">{values.interest.length} / 800</span>
          </div>
          <p className="field-error" id="interest-error" aria-live="polite">
            {errors.interest}
          </p>
        </div>

        <div className="form-field form-field--wide consent-field">
          <label>
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              checked={values.consent}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  consent: event.target.checked,
                }))
              }
              onBlur={handleBlur}
              aria-invalid={errors.consent ? "true" : "false"}
              aria-describedby="consent-error"
            />
            <span>
              I agree that Kori may use these details to respond to my
              expression of interest. <span aria-hidden="true">*</span>
            </span>
          </label>
          <p className="field-error" id="consent-error" aria-live="polite">
            {errors.consent}
          </p>
        </div>
      </div>

      <div className="form-submit-row">
        <p>Your information is securely submitted to Kori.</p>
        <button
          className="button"
          type="submit"
          disabled={submitting}
          aria-busy={submitting ? "true" : undefined}
        >
          {submitting ? "Submitting…" : "Submit interest →"}
        </button>
      </div>

      <div
        className={status.className}
        id="form-status"
        role="status"
        aria-live="polite"
        tabIndex={-1}
        ref={statusRef}
      >
        {status.content}
      </div>
    </form>
  );
}
