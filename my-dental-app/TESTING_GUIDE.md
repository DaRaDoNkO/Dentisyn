# 🧪 Appointment System Testing Guide

## 🚀 Quick Start

**Development Server:** http://localhost:5174/

The appointment system is now fully functional! Follow this guide to test all features.

---

## ✅ Test Checklist

### 1. **Access the Calendar**
- [ ] Navigate to http://localhost:5174/
- [ ] Click on "Calendar" in the navigation menu
- [ ] Verify calendar displays with week view

### 2. **View Switching** (Already tested - E2E passing)
- [ ] Click "Week" button - should show week grid view
- [ ] Click "Month" button - should show month grid view
- [ ] Click "List" button - should show list view
- [ ] Verify active button has blue highlight

### 3. **Create Appointment with Existing Patient**

**Step-by-step:**
1. Click on any time slot in the calendar
2. Modal should appear with title "New Appointment"
3. Type a patient name in the search box (e.g., "Sarah")
4. Search results should appear below
5. Click on a patient from the results
6. Patient info should display in blue alert box
7. Fill in appointment details:
   - **Doctor:** Select from dropdown
   - **Date:** Should be pre-filled with clicked date
   - **Start Time:** Enter time (e.g., 10:00)
   - **End Time:** Enter time (e.g., 10:30)
   - **Reason:** Type appointment reason
8. Click "Save Appointment"
9. **Expected Results:**
   - Modal closes automatically
   - Calendar refreshes
   - New appointment appears on calendar
   - Console logs: `[DEBUG] Appointment saved, refreshing calendar`

### 4. **Create Appointment with New Patient**

**Step-by-step:**
1. Click on any empty time slot
2. Click "New Patient" button
3. New patient form should appear
4. Fill in:
   - **Full Name:** e.g., "John Doe"
   - **Phone Number:** e.g., "555-1234"
5. Complete appointment details (doctor, times, reason)
6. Click "Save Appointment"
7. **Expected Results:**
   - Patient created in localStorage
   - Appointment created and linked to patient
   - Calendar shows new appointment
   - Console logs creation events

### 5. **Patient Search Functionality**

**Test Cases:**
- Type partial name (e.g., "Sar") → should show matching patients
- Type phone number → should find by phone
- Type non-existent name → should show "No patients found"
- Clear search → results disappear

### 6. **Modal Cleanup (Memory Leak Prevention)**

**Test:**
1. Open modal by clicking calendar slot
2. Close modal without saving (click X or backdrop)
3. Open modal again
4. Repeat 5-10 times
5. **Expected:** No performance degradation, no console errors

### 7. **Calendar Refresh After Save**

**Verification:**
1. Open browser console (F12)
2. Create new appointment
3. Look for these logs:
   ```
   [AUDIT] APPOINTMENT_SAVED | Patient: John Doe | Doctor: dr-ivanov | Time: ...
   [DEBUG] Appointment saved, refreshing calendar
   [DEBUG] Refreshing calendar with new appointments
   [DEBUG] Calendar refreshed with X events (3 mock + Y stored)
   ```
4. Verify appointment appears immediately without page refresh

### 8. **Doctor Filtering**

**Test:**
- [ ] Uncheck "Dr. Ivanov" checkbox → green appointments disappear
- [ ] Check it again → green appointments reappear
- [ ] Uncheck "Dr. Ruseva" checkbox → blue appointments disappear
- [ ] Verify filtering works with newly created appointments

### 9. **Drag & Drop (Previously Fixed)**

**Test:**
1. Click and drag an existing appointment to new time slot
2. Confirmation dialog should appear: "Move [Appointment] to new time?"
3. Click **OK** → appointment moves to new time
4. Try again and click **Cancel** → appointment stays in original slot

### 10. **Internationalization (i18n)**

**Test Language Switching:**
1. Click language toggle button (EN/BG)
2. Modal should close if open
3. Re-open modal
4. Verify all labels are in correct language:
   - "New Appointment" / "Ново Посещение"
   - "Search Patient" / "Търсене на Пациент"
   - "Full Name" / "Пълно Име"
   - etc.

---

## 🔍 Developer Console Checks

### Expected Console Logs (Happy Path)

```
[DEBUG] Calendar dateClick: 2025-01-25T10:00:00
[DEBUG] showAppointmentModal called with: 2025-01-25T10:00:00
[DEBUG] Modal container found/created, clearing previous content
[DEBUG] Found appointmentModal element, attempting to show
[DEBUG] Bootstrap modal created successfully, showing now
[DEBUG] Patient search: john
[AUDIT] APPOINTMENT_SAVED | Patient: John Doe | Doctor: dr-ivanov | Time: 2025-01-25T...
[DEBUG] Appointment saved, refreshing calendar
[DEBUG] Refreshing calendar with new appointments
[DEBUG] Calendar refreshed with 5 events (3 mock + 2 stored)
```

### Check LocalStorage Data

Open DevTools → Application → Local Storage → http://localhost:5174

**Keys to inspect:**
- `dentisyn-patients` → should contain patient objects
- `dentisyn-appointments` → should contain appointment objects
- `dentisyn-theme` → theme setting (light/dark)
- `dentisyn-language` → current language (en/bg)

**Sample appointment data:**
```json
{
  "id": "abc123",
  "patientId": "patient-xyz",
  "patientName": "John Doe",
  "phone": "555-1234",
  "doctor": "dr-ivanov",
  "startTime": "2025-01-25T10:00:00",
  "endTime": "2025-01-25T10:30:00",
  "reason": "Checkup",
  "status": "Confirmed"
}
```

---

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't appear
**Solution:**
1. Check console for Bootstrap errors
2. Verify Bootstrap loaded: `console.log(window.bootstrap)`
3. If undefined, refresh page (Ctrl+F5)

### Issue: "Bootstrap not loaded properly" alert
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear cache and reload
- Check network tab for 404 errors

### Issue: Appointment not appearing after save
**Solution:**
1. Check console for refresh logs
2. Verify `refreshCalendar()` was called
3. Check localStorage has appointment data
4. Try changing calendar view (Week → Month → Week)

### Issue: Duplicate event listeners
**Solution:**
- This should be fixed with cleanup listeners
- If modals feel "sluggish" after multiple opens, check for console errors
- Verify cleanup listener is running (add breakpoint in cleanup code)

### Issue: i18n not working
**Solution:**
1. Check `window.i18next` is defined
2. Verify translation files loaded: `i18next.t('appointment.newAppointment')`
3. Language toggle should reload modal content

---

## 📊 Performance Benchmarks

**Expected Performance:**
- Modal open time: < 100ms
- Calendar refresh: < 50ms
- Patient search (100 patients): < 10ms
- Memory usage: Stable (no leaks after 20+ modal opens)

**Load Testing:**
1. Create 20+ appointments
2. Switch between views rapidly
3. Open/close modal 20+ times
4. Verify no console errors or slowdown

---

## 🎯 Success Criteria

### All tests pass if:
- ✅ Build completes without errors
- ✅ All 30 tests passing (25 unit + 5 E2E)
- ✅ Modal opens on calendar click
- ✅ Patient search works
- ✅ New patient creation works
- ✅ Appointments save to localStorage
- ✅ Calendar refreshes automatically
- ✅ No duplicate event handlers
- ✅ No console errors
- ✅ i18n translations apply
- ✅ Memory usage stable

---

## 📝 Test Report Template

```markdown
## Test Session Report
**Date:** [Date]
**Tester:** [Name]
**Browser:** [Chrome/Firefox/Edge + Version]

### Results
- [ ] View switching: PASS / FAIL
- [ ] Existing patient appointment: PASS / FAIL
- [ ] New patient appointment: PASS / FAIL
- [ ] Patient search: PASS / FAIL
- [ ] Calendar refresh: PASS / FAIL
- [ ] Modal cleanup: PASS / FAIL
- [ ] Drag & drop: PASS / FAIL
- [ ] i18n: PASS / FAIL

### Issues Found
[Describe any bugs or unexpected behavior]

### Notes
[Additional observations]
```

---

## 🎉 Happy Testing!

The appointment system is production-ready. If you encounter any issues, check the [APPOINTMENT_SYSTEM_FIX_SUMMARY.md](./APPOINTMENT_SYSTEM_FIX_SUMMARY.md) for implementation details.

**Quick Commands:**
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Test production build
npx vitest        # Run unit tests
npx playwright test  # Run E2E tests
```
