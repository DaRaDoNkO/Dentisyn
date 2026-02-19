# Localhost Test Data

This folder contains temporary test data for the Dentisyn application while the real database is being developed.

## Files

- **doctors.json** - Test data for doctors/dentists
- **patients.json** - Sample patient records
- **appointments.json** - Sample appointment bookings

## Structure

### doctors.json
Contains doctor information including:
- `id` - Unique identifier (e.g., "dr-ivanov")
- `name` - Doctor's full name
- `specialty` - Medical specialty
- `startTime` - Working hours start (HH:MM format)
- `endTime` - Working hours end (HH:MM format)
- `color` - Calendar color code for visual identification

### patients.json
Contains patient information including:
- `id` - Unique patient identifier
- `name` - Patient's full name
- `phone` - Contact phone number
- `egn` - Bulgarian ID number (optional)
- `email` - Email address (optional)
- `address` - Physical address (optional)
- `createdAt` - Account creation timestamp

### appointments.json
Contains appointment bookings including:
- `id` - Unique appointment identifier
- `patientId` - Reference to patient ID
- `patientName` - Patient's full name
- `phone` - Contact phone number
- `doctor` - Reference to doctor ID
- `startTime` - Appointment start time (ISO 8601 format)
- `endTime` - Appointment end time (ISO 8601 format)
- `reason` - Reason for visit
- `status` - Appointment status ("Confirmed", "Waiting", "Completed")
- `createdAt` - Booking creation timestamp

## Usage

The application automatically loads this test data into localStorage on first run if no data exists.

**Note:** This is temporary storage. Once a real database is implemented, this folder will be removed and data will be migrated to the production database.

## Modifying Test Data

You can modify these JSON files to add, edit, or remove test data. After making changes:
1. Clear your browser's localStorage for the application
2. Refresh the page
3. The application will reload the updated test data

## Important

- Do NOT commit sensitive or real patient data to these files
- These files are for development and testing purposes only
- Ensure all dates/times follow the specified formats
- Maintain proper JSON syntax (commas, brackets, quotes)
