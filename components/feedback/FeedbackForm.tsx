"use client";

import { useState } from "react";

export function FeedbackForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const type = formData.get("type");
    const rating = formData.get("rating");
    const message = formData.get("message");

    const emailBody = encodeURIComponent(
      `Feedback Type: ${type}\nRating: ${rating}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:statstrive@gmail.com?subject=Statstrive Feedback&body=${emailBody}`;

    setSent(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:p-8"
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Feedback Type
          </label>
          <select
            name="type"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option>General Feedback</option>
            <option>Bug Report</option>
            <option>Feature Request</option>
            <option>Question / Content Issue</option>
            <option>Payment Issue</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Rating
          </label>
          <select
            name="rating"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option>5 - Excellent</option>
            <option>4 - Good</option>
            <option>3 - Okay</option>
            <option>2 - Poor</option>
            <option>1 - Very Poor</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Your Feedback
          </label>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Write your feedback here..."
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-white/40 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-violet-100"
        >
          Send Feedback
        </button>

        {sent && (
          <p className="text-center text-sm text-emerald-300">
            Your email app has been opened. Send the email from there.
          </p>
        )}
      </div>
    </form>
  );
}