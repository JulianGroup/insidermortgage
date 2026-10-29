"use client";
import React from 'react';
import TrustChips from './TrustChips';
import ScheduleCallForm from './ScheduleCallForm';
import './LeadCapture.css';

const LeadCapture = () => {
  return (
    <section className="lead-capture-section" id="contact">
      <div className="container lead-capture-container">
        <div className="lead-content">
          <h2>Ready to Take the Next Step?</h2>
          <p>
            Whether you&apos;re just starting to explore your options or you&apos;re ready to get pre-approved,
            our team is here to provide expert guidance tailored to your scenario.
          </p>
          <TrustChips placement="lead-capture" layout="row" />
        </div>

        <ScheduleCallForm source="LeadCapture" />
      </div>
    </section>
  );
};

export default LeadCapture;
