-- Seed Data for Numan & Associates Supabase Backend

-- 1. Seed clients table with some records from each department
INSERT INTO clients (id, name, service_type, department, payment_amount, payment_status, meta_data) VALUES
-- Taxation - US Taxation
('b2a95c96-3c05-4c07-b08e-0498a44d0101', 'Moiz Chaudhry', 'Form 1040 Filing', 'taxation-us', 'PKR 110,000', 'Paid', '{"taxId": "SSN: ***-**-6789", "phone": "+1 650-555-0199"}'),
-- Taxation - Germany Taxation
('b2a95c96-3c05-4c07-b08e-0498a44d0102', 'Hans Müller', 'Einkommensteuer', 'taxation-de', 'PKR 140,000', 'Paid', '{"taxId": "Steuer-ID: DE123456789", "phone": "+49 176-5555-1234"}'),
-- Taxation - Pakistan Income Tax CFO
('b2a95c96-3c05-4c07-b08e-0498a44d0121', 'Numan Ali', 'Income Tax Filing', 'taxation-pk-income-finance', 'PKR 45,000', 'Paid', '{"cnic": "35201-1234567-1", "phone": "0300-1234567", "pin": "8821", "date": "15 May 2026"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0122', 'Zainab Bibi', 'Income Tax Filing', 'taxation-pk-income-finance', 'PKR 35,000', 'Partial', '{"cnic": "35201-9876543-2", "phone": "0312-7654321", "pin": "9123", "date": "10 May 2026"}'),
-- Taxation - Pakistan Sales Tax CFO
('b2a95c96-3c05-4c07-b08e-0498a44d0123', 'Hassan Retailers', 'Retail Audit', 'taxation-pk-sales-finance', 'PKR 60,000', 'Paid', '{"strn": "3277876123456", "phone": "0321-4455667"}'),
-- Taxation - Pakistan Company Registration CFO
('b2a95c96-3c05-4c07-b08e-0498a44d0124', 'Apex Tech LLC', 'Private Limited', 'taxation-pk-company-reg', 'PKR 85,000', 'Paid', '{"companyName": "Apex Tech Private Limited", "phone": "0333-9988776"}'),
-- Department 'immigration'
('b2a95c96-3c05-4c07-b08e-0498a44d0103', 'Asma Ali', 'Study Visa', 'immigration', 'PKR 150,000', 'Paid', '{"tasksCount": "3", "phone": "0300-8887766"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0104', 'Bilal Khan', 'Express Entry', 'immigration', 'PKR 250,000', 'Pending', '{"tasksCount": "5", "phone": "0321-5554433"}'),
-- Department 'law'
('b2a95c96-3c05-4c07-b08e-0498a44d0105', 'Salim & Sons', 'Corporate Consultation', 'law', 'PKR 150,000', 'Pending', '{"activeCases": "1", "primaryAdvocate": "Adv. Numan", "lastActivity": "Today"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0106', 'Karachi Logistics', 'Civil Litigation', 'law', 'PKR 300,000', 'Paid', '{"activeCases": "2", "primaryAdvocate": "Adv. Numan", "lastActivity": "Yesterday"}'),
-- Department 'amazon'
('b2a95c96-3c05-4c07-b08e-0498a44d0107', 'Ahmed Electronics', 'Store Launch', 'amazon', 'PKR 180,000', 'Paid', '{"marketplace": "US", "activeStore": "Yes", "revenue30d": "$12,400"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0108', 'Kashif Apparel', 'PPC Management', 'amazon', 'PKR 90,000', 'Pending', '{"marketplace": "UK", "activeStore": "Yes", "revenue30d": "$4,500"}'),
-- Department 'language'
('b2a95c96-3c05-4c07-b08e-0498a44d0109', 'Dr. Christian', 'German Translation', 'language', 'PKR 30,000', 'Paid', '{"wordCount": "4,500", "dueDate": "06 Jun 2026"}'),
-- Department 'academic'
('b2a95c96-3c05-4c07-b08e-0498a44d0110', 'M. Haris', 'University Admission', 'academic', 'PKR 80,000', 'Paid', '{"university": "TU Munich", "status": "Document Review"}'),
-- Department 'training'
('b2a95c96-3c05-4c07-b08e-0498a44d0111', 'Ayesha Omer', 'IELTS Preparation', 'training', 'PKR 25,000', 'Paid', '{"batchCode": "IELTS-MAY26", "progress": "60%"}'),
-- Department 'investment'
('b2a95c96-3c05-4c07-b08e-0498a44d0112', 'Tariq Mahmood', 'Advisory Portfolio', 'investment', 'PKR 5,000,000', 'Paid', '{"portfolioType": "Balanced Growth", "currentValue": "PKR 5,340,000", "roiPct": "+6.8%"}'),
-- Department 'marketing' (Facebook Page records, LinkedIn Page records, YouTube Playlist records, as clients)
('b2a95c96-3c05-4c07-b08e-0498a44d0113', 'Numan & Associates Law', 'Facebook Page', 'marketing', 'PKR 0', 'Paid', '{"admin": "Sara Khan", "followers": "12,500", "engagementRate": "3.2%", "lastPost": "12 hours ago", "status": "Active"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0114', 'Tax Consult Pakistan', 'Facebook Page', 'marketing', 'PKR 0', 'Paid', '{"admin": "Ali Raza", "followers": "8,200", "engagementRate": "2.8%", "lastPost": "1 day ago", "status": "Active"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0115', 'Immigration News PK', 'Facebook Page', 'marketing', 'PKR 0', 'Paid', '{"admin": "Fatima Sheikh", "followers": "5,400", "engagementRate": "4.5%", "lastPost": "2 hours ago", "status": "Active"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0116', 'Advocate Numan - Corporate Law', 'LinkedIn Page', 'marketing', 'PKR 0', 'Paid', '{"connections": "4,800", "postFrequency": "3 / week", "engagementRate": "5.4%", "lastUpdated": "2 days ago", "status": "Active"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0117', 'Numan & Associates Partners', 'LinkedIn Page', 'marketing', 'PKR 0', 'Paid', '{"connections": "15,200", "postFrequency": "5 / week", "engagementRate": "4.1%", "lastUpdated": "Today", "status": "Active"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0118', 'Pakistan Taxation Guide 2026', 'YouTube Playlist', 'marketing', 'PKR 0', 'Paid', '{"department": "Taxation Services", "totalVideos": "24", "totalViews": "18,400", "subscribers": "3,500", "lastUpload": "3 days ago"}'),
('b2a95c96-3c05-4c07-b08e-0498a44d0119', 'Corporate Registration Process', 'YouTube Playlist', 'marketing', 'PKR 0', 'Paid', '{"department": "Corporate Law", "totalVideos": "12", "totalViews": "9,200", "subscribers": "1,200", "lastUpload": "1 week ago"}')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed tasks table
INSERT INTO tasks (id, title, department, assigned_to, due_date, priority, status, progress, client_id) VALUES
('d2a95c96-3c05-4c07-b08e-0498a44d0201', 'SECP Annual Return Filing', 'system', 'Zainab Bibi', '05 Jun 2026', 'High', 'In Progress', '50%', 'b2a95c96-3c05-4c07-b08e-0498a44d0105'),
('d2a95c96-3c05-4c07-b08e-0498a44d0202', 'USA Form 1040 Preparation', 'system', 'Moiz Chaudhry', '15 Jun 2026', 'High', 'In Progress', '70%', 'b2a95c96-3c05-4c07-b08e-0498a44d0101'),
('d2a95c96-3c05-4c07-b08e-0498a44d0203', 'Immigration Case Audit', 'system', 'Sara Khan', '08 Jun 2026', 'High', 'Not Started', '0%', 'b2a95c96-3c05-4c07-b08e-0498a44d0103'),
('d2a95c96-3c05-4c07-b08e-0498a44d0204', 'PPC Campaign Listing Optimization', 'system', 'Ali Raza', '12 Jun 2026', 'Medium', 'In Progress', '40%', 'b2a95c96-3c05-4c07-b08e-0498a44d0107'),
-- Department 'law' specific tasks
('d2a95c96-3c05-4c07-b08e-0498a44d0205', 'Prepare written response for Salim & Sons', 'law', 'Junior Counsel', '15 Jun 2026', 'High', 'Not Started', '0%', 'b2a95c96-3c05-4c07-b08e-0498a44d0105'),
('d2a95c96-3c05-4c07-b08e-0498a44d0206', 'Review witness statements for Karachi Logistics', 'law', 'Fatima Zahra', '10 Jun 2026', 'High', 'In Progress', '50%', 'b2a95c96-3c05-4c07-b08e-0498a44d0106'),
-- Department 'immigration' specific tasks
('d2a95c96-3c05-4c07-b08e-0498a44d0207', 'Document Checklist Audit', 'immigration', 'Sara Khan', '05 Jun 2026', 'High', 'In Progress', '50%', 'b2a95c96-3c05-4c07-b08e-0498a44d0103')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed goals table
INSERT INTO goals (id, description, department, target, current_progress, pct_achieved, deadline, status, meta_data) VALUES
('e2a95c96-3c05-4c07-b08e-0498a44d0301', 'Onboard 15 new Amazon Private Label clients', 'amazon', '15 Stores', '10 Stores', '66%', '30 Jun 2026', 'In Progress', '{}'),
('e2a95c96-3c05-4c07-b08e-0498a44d0302', 'Expand Spousal Visas by 20%', 'immigration', '100%', '60%', '60%', '30 Jun 2026', 'In Progress', '{}'),
('e2a95c96-3c05-4c07-b08e-0498a44d0303', 'Increase corporate law retainer intake by 15%', 'law', '15 retained', '11 retained', '73%', '31 Dec 2026', 'In Progress', '{"practice_area": "Corporate Law"}'),
('e2a95c96-3c05-4c07-b08e-0498a44d0304', 'Achieve Average 8.0 Band in IELTS Batches', 'training', 'Band 8.0', 'Band 7.5', '90%', '15 Jun 2026', 'In Progress', '{}'),
('e2a95c96-3c05-4c07-b08e-0498a44d0305', 'Translate 100k words for corporate partners', 'language', '100,000 words', '75,000 words', '75%', '30 Jun 2026', 'In Progress', '{}')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed taxation_returns table (Chief Taxation Office)
INSERT INTO taxation_returns (id, client_name, tax_type, period_or_year, status, filed_on, remarks) VALUES
('f2a95c96-3c05-4c07-b08e-0498a44d0401', 'Numan Ali', 'income', '2025', 'Filed', '12 Oct 2025', 'Direct filing complete'),
('f2a95c96-3c05-4c07-b08e-0498a44d0402', 'Zainab Bibi', 'income', '2025', 'In Review', '18 Oct 2025', 'Awaiting audit'),
('f2a95c96-3c05-4c07-b08e-0498a44d0403', 'Hassan Retailers', 'sales', 'May 2026', 'Filed', '20 May 2026', 'Filed on time'),
('f2a95c96-3c05-4c07-b08e-0498a44d0404', 'Apex Tech Private Limited', 'company', '2025', 'Filed', '15 Jan 2026', 'Form 29 submitted')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed litigation_cases table (Chief Litigation Cases Office)
INSERT INTO litigation_cases (id, name, case_type, status, amount, received, next_hearing) VALUES
('a2a95c96-3c05-4c07-b08e-0498a44d0501', 'Siddique & Co.', 'income', 'Ongoing', 'PKR 150,000', 'PKR 75,000', '14 Jun 2026'),
('a2a95c96-3c05-4c07-b08e-0498a44d0502', 'Karachi Logistics', 'sales', 'Hearing', 'PKR 250,000', 'PKR 125,000', '22 Jun 2026')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed law_hearings table
INSERT INTO law_hearings (id, date, time, case_name, court, priority) VALUES
('12a95c96-3c05-4c07-b08e-0498a44d0601', '15 Jun', '09:30 AM', 'Salim vs FBR', 'High Court Lahore', 'High Priority'),
('12a95c96-3c05-4c07-b08e-0498a44d0602', '22 Jun', '11:00 AM', 'Karachi Logistics Sales Dispute', 'Appellate Tribunal', 'Medium Priority')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed reports table
INSERT INTO reports (id, name, category, period, prepared_by, status) VALUES
('22a95c96-3c05-4c07-b08e-0498a44d0701', 'Q1 Revenue Summary — All Departments', 'Financial', 'Jan–Mar 2026', 'Numan Ali', 'Published'),
('22a95c96-3c05-4c07-b08e-0498a44d0702', 'Immigration Case Throughput Analysis', 'Immigration', 'Apr 2026', 'Sarah Khan', 'Draft'),
('22a95c96-3c05-4c07-b08e-0498a44d0703', 'Taxation Compliance Status Report', 'Taxation', 'FY 2025–26', 'Ali Hassan', 'Published'),
('22a95c96-3c05-4c07-b08e-0498a44d0704', 'Amazon Seller Account Health Audit', 'Amazon', 'May 2026', 'Ahmed Malik', 'Under Review'),
('22a95c96-3c05-4c07-b08e-0498a44d0705', 'Client Acquisition & Retention KPIs', 'Management', 'Q2 2026', 'Numan Ali', 'Draft'),
('22a95c96-3c05-4c07-b08e-0498a44d0706', 'Law Litigation Tracker Quarterly', 'Law', 'Jan–Jun 2026', 'Fatima Zahra', 'Published')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed reminders table
INSERT INTO reminders (id, title, service, client_name, due_date, priority, status) VALUES
('32a95c96-3c05-4c07-b08e-0498a44d0801', 'FBR Income Tax Filing Deadline', 'Taxation Services', 'Numan Ali', '05 Jun 2026', 'High', 'Pending'),
('32a95c96-3c05-4c07-b08e-0498a44d0802', 'SECP Annual Returns Board Meeting', 'Company Registration', 'Apex Tech LLC', '10 Jun 2026', 'Medium', 'Pending'),
('32a95c96-3c05-4c07-b08e-0498a44d0803', 'Immigration Interview Prep Session', 'Immigration Services', 'Asma Ali', '08 Jun 2026', 'High', 'Completed'),
('32a95c96-3c05-4c07-b08e-0498a44d0804', 'Amazon Store Audit Check', 'Amazon Services', 'Ahmed Electronics', '12 Jun 2026', 'Low', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed settings_users table
INSERT INTO settings_users (id, name, role, access, status) VALUES
('42a95c96-3c05-4c07-b08e-0498a44d0901', 'Numan Ali', 'Administrator', 'All Modules', 'Active'),
('42a95c96-3c05-4c07-b08e-0498a44d0902', 'Sarah Khan', 'Senior Associate', 'Immigration, Law, Taxation', 'Active'),
('42a95c96-3c05-4c07-b08e-0498a44d0903', 'Ahmed Malik', 'Amazon Specialist', 'Amazon Services', 'Active'),
('42a95c96-3c05-4c07-b08e-0498a44d0904', 'Fatima Zahra', 'Legal Advisor', 'Law, Immigration', 'On Leave'),
('42a95c96-3c05-4c07-b08e-0498a44d0905', 'Ali Hassan', 'Tax Consultant', 'Taxation, Company Reg', 'Active')
ON CONFLICT (id) DO NOTHING;
