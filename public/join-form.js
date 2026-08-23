const networkForm = document.querySelector('#network-form');

const SUPABASE_URL = 'https://plnpgjjrcvehdsigsgiv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_akKi4NOz-qXNNL_FMX7r3Q_rbyxv0Xu';
const WAITING_LIST_ENDPOINT = `${SUPABASE_URL}/rest/v1/waiting_list_form`;

if (networkForm) {
  const fields = {
    firstName: networkForm.elements.firstName,
    lastName: networkForm.elements.lastName,
    email: networkForm.elements.email,
    role: networkForm.elements.role,
    country: networkForm.elements.country,
    linkedin: networkForm.elements.linkedin,
    interest: networkForm.elements.interest,
    consent: networkForm.elements.consent,
  };

  const roleFromHash = window.location.hash.replace('#', '');
  if ([...fields.role.options].some((option) => option.value === roleFromHash)) {
    fields.role.value = roleFromHash;
  }

  const setError = (field, message) => {
    const error = document.querySelector(`#${field.id}-error`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  };

  const validate = () => {
    let valid = true;
    const requiredText = [fields.firstName, fields.lastName, fields.country];

    requiredText.forEach((field) => {
      const message = field.value.trim() ? '' : 'This field is required.';
      setError(field, message);
      if (message) valid = false;
    });

    const emailMessage = !fields.email.value.trim()
      ? 'Enter your email address.'
      : fields.email.validity.valid
        ? ''
        : 'Enter a valid email address.';
    setError(fields.email, emailMessage);
    if (emailMessage) valid = false;

    const roleMessage = fields.role.value ? '' : 'Select the role closest to yours.';
    setError(fields.role, roleMessage);
    if (roleMessage) valid = false;

    const linkedInMessage = !fields.linkedin.value || fields.linkedin.validity.valid
      ? ''
      : 'Enter a complete URL beginning with https://';
    setError(fields.linkedin, linkedInMessage);
    if (linkedInMessage) valid = false;

    const consentMessage = fields.consent.checked ? '' : 'Consent is required before submitting.';
    setError(fields.consent, consentMessage);
    if (consentMessage) valid = false;

    return valid;
  };

  fields.interest.addEventListener('input', () => {
    document.querySelector('#interest-count').textContent = `${fields.interest.value.length} / 800`;
  });

  Object.values(fields).forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate();
    });
  });

  networkForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.querySelector('#form-status');
    const submitButton = networkForm.querySelector('[type="submit"]');

    if (!validate()) {
      const firstInvalid = networkForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      status.className = 'form-status form-status--error';
      status.textContent = 'Review the highlighted fields before continuing.';
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Submitting…';
    status.className = 'form-status form-status--notice';
    status.textContent = 'Sending your information securely…';

    const payload = {
      first_name: fields.firstName.value.trim(),
      last_name: fields.lastName.value.trim(),
      email: fields.email.value.trim().toLowerCase(),
      role: fields.role.value,
      country: fields.country.value.trim(),
      linkedin: fields.linkedin.value.trim() || null,
      interest: fields.interest.value.trim() || null,
      consent: fields.consent.checked,
    };

    try {
      const response = await fetch(WAITING_LIST_ENDPOINT, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);

      networkForm.reset();
      document.querySelector('#interest-count').textContent = '0 / 800';
      status.className = 'form-status form-status--success';
      status.innerHTML = '<strong>Thank you for joining the Kori network.</strong><span>Your information was submitted successfully. We’ll be in touch when there is a relevant next step.</span>';
    } catch (error) {
      console.error('Kori waiting-list submission failed:', error);
      status.className = 'form-status form-status--error';
      status.innerHTML = '<strong>We could not submit your information.</strong><span>Please try again shortly. If the problem continues, contact Kori directly.</span>';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = 'Submit interest →';
      status.focus();
    }
  });
}
