"use client";
import React, { useState, useRef } from 'react';
import { submitConsultationLead } from '../lib/submitLead';
import './LeadCapture.css';

// Format digits into (XXX) XXX-XXXX
function formatUsPhoneInput(value) {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  const trimmed = normalized.slice(0, 10);
  if (trimmed.length === 0) return '';
  if (trimmed.length < 4) return `(${trimmed}`;
  if (trimmed.length < 7) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6, 10)}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

function isValidUsPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{9}$/.test(normalized);
}

const PREFERRED_DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const TIME_OPTIONS = [
  'Morning (9 AM–12 PM)',
  'Afternoon (12 PM–4 PM)',
  'Late afternoon (4 PM–6 PM)',
  "I'm flexible"
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  category: '',
  preferredDays: [],
  preferredTime: "I'm flexible",
  smsConsent: false
};

const EMPTY_ERRORS = { name: '', email: '', phone: '', category: '' };

/**
 * Shared "Schedule a Call" consultation form used on every page of the site.
 * Saves the lead to Firestore and emails it to rjain@insidermtg.com and
 * dsider@insidermtg.com via submitConsultationLead(). The page the visitor
 * was on is detected automatically from the URL.
 */
const ScheduleCallForm = ({ source = 'Schedule a Call Form', title = 'Request a Consultation' }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS);
  const [showContactSection, setShowContactSection] = useState(false);
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const categoryRef = useRef(null);

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.preferredDays.includes(day);
      const nextDays = exists
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      return { ...prev, preferredDays: nextDays };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue =
      type === 'checkbox'
        ? checked
        : name === 'phone'
        ? formatUsPhoneInput(value)
        : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateContactFields = () => {
    const errors = { ...EMPTY_ERRORS };

    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g., you@example.com).';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Please enter a 10-digit US phone number.';
    } else if (!isValidUsPhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit US phone number, e.g., (555) 123-4567.';
    }

    if (!formData.category) {
      errors.category = 'Please select a profile option.';
    }

    setFieldErrors(errors);

    if (errors.name) {
      nameRef.current?.focus();
      return false;
    }
    if (errors.email) {
      emailRef.current?.focus();
      return false;
    }
    if (errors.phone) {
      phoneRef.current?.focus();
      return false;
    }
    if (errors.category) {
      categoryRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleOpenContactDetails = () => {
    setShowContactSection(true);
    setTimeout(() => {
      nameRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateContactFields()) {
      return;
    }

    setStatus('submitting');

    try {
      await submitConsultationLead(formData, source);

      setStatus('success');
      setFormData(EMPTY_FORM);
      setFieldErrors(EMPTY_ERRORS);
      setShowContactSection(false);
    } catch (error) {
      console.error('Submission Error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="consult-mockup-card">
      <h3 className="consult-card-title">{title}</h3>

      <form onSubmit={handleSubmit} className="consult-mockup-form" noValidate>
        {/* STEP 1: PREFERRED DAY & TIME */}
        <h4 className="consult-schedule-heading">When is a good time to connect?</h4>
        <p className="consult-schedule-subtext">Let us know what works best for you.</p>

        <div className="consult-radio-section">
          <span className="consult-radio-group-title">Preferred day</span>
          <div className="consult-options-grid consult-days-grid">
            {PREFERRED_DAY_OPTIONS.map((day) => (
              <label key={day} className="consult-radio-option">
                <input
                  type="checkbox"
                  name="preferredDays"
                  value={day}
                  checked={formData.preferredDays.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  className="consult-multi-radio-input"
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="consult-radio-section">
          <span className="consult-radio-group-title">Preferred time (Pacific Time)</span>
          <div className="consult-options-grid consult-times-grid">
            {TIME_OPTIONS.map((time) => (
              <label key={time} className="consult-radio-option">
                <input
                  type="radio"
                  name="preferredTime"
                  value={time}
                  checked={formData.preferredTime === time}
                  onChange={handleChange}
                />
                <span>{time}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="button" className="consult-dark-pill-btn" onClick={handleOpenContactDetails}>
          Schedule Time
        </button>

        {/* STEP 2: CONTACT DETAILS (OPENS WHEN SCHEDULE TIME IS PRESSED) */}
        {showContactSection && (
          <div className="consult-schedule-drawer">
            <p className="consult-card-subtitle" style={{ margin: '0 0 0.25rem 0' }}>
              Tell us a little about yourself, and we&apos;ll help you take the next step.
            </p>

            <div className="consult-field-group">
              <label className="consult-label">Full Name</label>
              <input
                ref={nameRef}
                type="text"
                name="name"
                className={`consult-pill-input ${fieldErrors.name ? 'consult-input-error' : ''}`}
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
              {fieldErrors.name && <span className="consult-error-text">{fieldErrors.name}</span>}
            </div>

            <div className="consult-field-group">
              <label className="consult-label">Email Address</label>
              <input
                ref={emailRef}
                type="email"
                name="email"
                className={`consult-pill-input ${fieldErrors.email ? 'consult-input-error' : ''}`}
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {fieldErrors.email && <span className="consult-error-text">{fieldErrors.email}</span>}
            </div>

            <div className="consult-field-group">
              <label className="consult-label">Phone Number</label>
              <input
                ref={phoneRef}
                type="tel"
                name="phone"
                className={`consult-pill-input ${fieldErrors.phone ? 'consult-input-error' : ''}`}
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
              {fieldErrors.phone ? (
                <span className="consult-error-text">{fieldErrors.phone}</span>
              ) : (
                <span className="consult-helper-text">
                  We&apos;ll use this to follow up on your consultation request.
                </span>
              )}
            </div>

            <div className="consult-field-group">
              <label className="consult-label">I am best described as a...</label>
              <select
                ref={categoryRef}
                name="category"
                className={`consult-pill-select ${fieldErrors.category ? 'consult-input-error' : ''}`}
                required
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select a profile...
                </option>
                <option value="Self-Employed">Self-Employed Borrower</option>
                <option value="Retiree">Retiree</option>
                <option value="Real Estate Investor">Real Estate Investor (Rental Property)</option>
                <option value="First-Time Home Buyer">First-Time Home Buyer</option>
                <option value="Other">Other / Standard Refinance</option>
              </select>
              {fieldErrors.category && (
                <span className="consult-error-text">{fieldErrors.category}</span>
              )}
            </div>

            <div className="consult-sms-consent">
              <label className="consult-sms-label">
                <input
                  type="checkbox"
                  name="smsConsent"
                  checked={formData.smsConsent}
                  onChange={handleChange}
                />
                <strong>Yes, you may text me.</strong>
              </label>
              <p className="consult-sms-disclaimer">
                I agree to receive text messages from Insider Mortgage about my consultation
                request and scheduling. Consent is not a condition of purchasing services.
                Message frequency varies. Message and data rates may apply. Reply STOP to opt
                out.
              </p>
            </div>

            <button
              type="submit"
              className="consult-dark-pill-btn consult-final-submit"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Request a Call'}
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="form-status status-success">
            Thank you! Your consultation request has been received. We will be in touch shortly.
          </div>
        )}
        {status === 'error' && (
          <div className="form-status status-error">
            There was an error sending your request. Please try again later.
          </div>
        )}
      </form>
    </div>
  );
};

export default ScheduleCallForm;
