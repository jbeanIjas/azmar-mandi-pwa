"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Clock3, Send, Users, X } from "lucide-react";

type EventBookingProps = {
  isOpen: boolean;
  onClose: () => void;
};

type DateOption = { value: string; weekday: string; day: string; month: string };

const timeOptions = [
  { value: '11:30', label: '11:30 AM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:30', label: '8:30 PM' },
];

const BOOKING_BUFFER_MS = 8 * 60 * 60 * 1000;

function toLocalDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDateOptions(startDate: Date): DateOption[] {
  const formatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    const parts = formatter.formatToParts(date);
    return {
      value: toLocalDateValue(date),
      weekday: toLocalDateValue(date) === toLocalDateValue(new Date()) ? 'Today' : (parts.find((part) => part.type === 'weekday')?.value ?? ''),
      day: parts.find((part) => part.type === 'day')?.value ?? '',
      month: parts.find((part) => part.type === 'month')?.value ?? '',
    };
  });
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '46px',
  padding: '11px 13px',
  border: '1px solid var(--border-subtle)',
  borderRadius: '11px',
  outline: 'none',
  background: '#fafafa',
  color: '#212121',
  font: 'inherit',
  fontSize: '13px',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  color: '#555',
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
};

export default function EventBooking({ isOpen, onClose }: EventBookingProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('Wedding Catering');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [earliestBooking] = useState(() => new Date(Date.now() + BOOKING_BUFFER_MS));
  const [dateOptions] = useState<DateOption[]>(() => createDateOptions(earliestBooking));
  const [scheduleError, setScheduleError] = useState('');
  const [guests, setGuests] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const earliestDate = toLocalDateValue(earliestBooking);
  const earliestTime = `${String(earliestBooking.getHours()).padStart(2, '0')}:${String(earliestBooking.getMinutes()).padStart(2, '0')}`;

  const isScheduleTooSoon = (dateValue: string, timeValue: string, threshold = earliestBooking) => {
    if (!dateValue || !timeValue) return false;
    return new Date(`${dateValue}T${timeValue}:00`).getTime() < threshold.getTime();
  };

  const selectDate = (value: string) => {
    setEventDate(value);
    setScheduleError('');
    if (isScheduleTooSoon(value, eventTime)) setEventTime('');
  };

  const selectTime = (value: string) => {
    setEventTime(value);
    setScheduleError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const liveEarliestBooking = new Date(Date.now() + BOOKING_BUFFER_MS);
    if (isScheduleTooSoon(eventDate, eventTime, liveEarliestBooking)) {
      setScheduleError('Please choose a date and time at least 8 hours from now.');
      return;
    }

    const message = [
      'Hello Azmar Mandi, I would like to enquire about your catering service:',
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Catering occasion: ${eventType}`,
      `Service date: ${eventDate}`,
      `Serving time: ${eventTime}`,
      `Guests: ${guests}`,
      `Venue: ${venue}`,
      notes.trim() ? `Additional Details: ${notes.trim()}` : '',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/918590109472?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 100, display: isOpen ? 'block' : 'none',
          background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(4px)'
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Catering service enquiry"
        style={{
          position: 'fixed', zIndex: 101, top: 0, right: 0, display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: '450px', height: '100dvh', background: '#fff',
          boxShadow: '-10px 0 30px rgba(33,33,33,.14)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(189,29,75,.1)', color: 'var(--accent-red)' }}>
              <CalendarDays size={20} />
            </span>
            <div>
              <h2 style={{ margin: 0, color: '#212121', fontSize: '19px' }}>Catering Service</h2>
              <p style={{ margin: '2px 0 0', color: '#888', fontSize: '10px' }}>Plan food and service for your occasion</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close catering enquiry" style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', border: 0, borderRadius: '50%', background: '#f4f2f2', color: '#555', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', minHeight: 0, flex: 1, flexDirection: 'column' }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflowY: 'auto', padding: '20px', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={labelStyle}>Your name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={fieldStyle} /></label>
              <label style={labelStyle}>Phone<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" style={fieldStyle} /></label>
            </div>

            <label style={labelStyle}>Catering occasion
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={fieldStyle}>
                <option>Wedding Catering</option><option>Corporate Catering</option><option>Birthday Catering</option><option>Engagement Catering</option><option>Family Function</option><option>Other</option>
              </select>
            </label>

            <fieldset style={{ minWidth: 0, margin: 0, padding: 0, border: 0 }}>
              <legend style={{ marginBottom: '8px', color: '#555', fontSize: '10px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>Service date</legend>
              <div style={{ display: 'flex', overflowX: 'auto', padding: '1px 1px 6px', gap: '8px', scrollbarWidth: 'none' }}>
                {dateOptions.map((option) => {
                  const selected = eventDate === option.value;
                  const endOfDay = new Date(`${option.value}T23:59:59`);
                  const disabled = endOfDay.getTime() < earliestBooking.getTime();
                  return (
                    <button key={option.value} type="button" disabled={disabled} onClick={() => selectDate(option.value)} aria-pressed={selected} style={{ display: 'flex', minWidth: '66px', padding: '9px 8px', flexDirection: 'column', alignItems: 'center', gap: '2px', border: selected ? '1px solid var(--accent-red)' : '1px solid var(--border-subtle)', borderRadius: '12px', background: selected ? 'rgba(189,29,75,.09)' : '#fafafa', color: selected ? 'var(--accent-red)' : '#555', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .38 : 1 }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }}>{option.weekday}</span>
                      <strong style={{ fontSize: '18px', lineHeight: 1.1 }}>{option.day}</strong>
                      <span style={{ fontSize: '9px', textTransform: 'uppercase' }}>{option.month}</span>
                    </button>
                  );
                })}
              </div>
              <label style={{ ...labelStyle, position: 'relative', marginTop: '7px' }}>
                <span style={{ color: '#888', fontSize: '9px' }}>Or choose another date</span>
                <CalendarDays size={16} style={{ position: 'absolute', zIndex: 1, top: 34, left: 13, color: 'var(--accent-red)' }} />
                <input required type="date" value={eventDate} min={earliestDate} onChange={(e) => selectDate(e.target.value)} style={{ ...fieldStyle, paddingLeft: '40px' }} />
              </label>
            </fieldset>

            <fieldset style={{ minWidth: 0, margin: 0, padding: 0, border: 0 }}>
              <legend style={{ marginBottom: '8px', color: '#555', fontSize: '10px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>Serving time</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                {timeOptions.map((option) => {
                  const selected = eventTime === option.value;
                  const disabled = isScheduleTooSoon(eventDate, option.value);
                  return <button key={option.value} type="button" disabled={disabled} onClick={() => selectTime(option.value)} aria-pressed={selected} style={{ padding: '10px 5px', border: selected ? '1px solid var(--accent-red)' : '1px solid var(--border-subtle)', borderRadius: '10px', background: selected ? 'rgba(189,29,75,.09)' : '#fafafa', color: selected ? 'var(--accent-red)' : '#555', fontSize: '10px', fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .38 : 1 }}>{option.label}</button>;
                })}
              </div>
              <label style={{ ...labelStyle, position: 'relative', marginTop: '9px' }}>
                <span style={{ color: '#888', fontSize: '9px' }}>Or choose a custom time</span>
                <Clock3 size={16} style={{ position: 'absolute', zIndex: 1, top: 34, left: 13, color: 'var(--accent-red)' }} />
                <input required type="time" value={eventTime} min={eventDate === earliestDate ? earliestTime : undefined} onChange={(e) => selectTime(e.target.value)} style={{ ...fieldStyle, paddingLeft: '40px' }} />
              </label>
              {scheduleError && <p role="alert" style={{ margin: '9px 0 0', color: '#b33535', fontSize: '10px', fontWeight: 700 }}>{scheduleError}</p>}
            </fieldset>

            <label style={labelStyle}>Number of guests
              <span style={{ position: 'relative' }}>
                <Users size={16} style={{ position: 'absolute', top: 15, left: 13, color: '#999' }} />
                <input required min="1" type="number" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="Expected guest count" style={{ ...fieldStyle, paddingLeft: '40px' }} />
              </span>
            </label>
            <label style={labelStyle}>Delivery venue / location<input required value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Where should we provide catering?" style={fieldStyle} /></label>
            <label style={labelStyle}>Menu and service requirements<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferred dishes, dietary needs, serving staff, setup, or anything else" rows={4} style={{ ...fieldStyle, resize: 'vertical' }} /></label>
          </div>

          <div style={{ padding: '18px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border-subtle)', background: '#fff' }}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '15px 20px', gap: '9px', border: 0, borderRadius: '12px', background: 'var(--accent-red)', color: '#fff', fontSize: '12px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Request Catering via WhatsApp <Send size={16} />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
