import os
import django
import random
import string

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import Subject

def generate_code():
    """Generate a random 6-character code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Subject data organized by year
subjects_data = {
    1: [  # 1st Year
        'Computer Workshop',
        'Electronics Workshop',
        'English Fluency-1',
        'Electrical Workshop',
        'Fundamentals of Computer Programming',
        'Financial Literacy',
        'Hindi Bhasha and Takneek',
        'Introduction of Electrical and Electronics Engineering',
        'Mathematics-1',
        'Physics',
    ],
    2: [  # 2nd Year
        'Analysis and Design of Algorithms',
        'Analog and Digital Electronics Circuits',
        'Advanced Electrical Workshop',
        'Database Management System',
        'Digital Empowerment',
        'Digital Electronics-I',
        'Digital System Design',
        'Electronic Devices and Circuits',
        'Electrical Machines-I',
        'Electrical Network Analysis',
        'Energy and its Resources',
        'Environmental Science-II',
        'Fundamentals of Cyber Security',
        'Network Analysis and Synthesis',
        'Probability and Statistics for Computer Science',
        'VLSI Technology and Design',
        'Vedic Maths-II',
        'Software Requirement Engineering',
        'Fundamentals of DBMS',
    ],
    3: [  # 3rd Year
        'Analog Communication Systems',
        'Artificial Intelligence and Machine Learning',
        'Advanced Digital VLSI Circuits and Physical Design',
        'Computer Networks',
        'Control System',
        'Control System Engineering',
        'Digital Signal Processing',
        'Electromagnetic Field Theory',
        'Electrical Storage and Management System',
        'Foundations of Computer Networks',
        'Neural Networks',
        'Utilization of Electric Power',
        'Power System Analysis',
        'Software Testing',
        'Theory of Computation',
        'Digital Image Processing',
        'Network Technologies and Interfacing',
    ]
}

def populate_subjects():
    """Populate the database with all subjects"""
    print("Starting to populate subjects...")
    created_count = 0
    existing_count = 0
    
    for year, subjects in subjects_data.items():
        year_name = ['1st Year', '2nd Year', '3rd Year', '4th Year'][year - 1]
        print(f"\n{year_name}:")
        for subject_name in subjects:
            # Generate a unique code
            code = generate_code()
            while Subject.objects.filter(code=code).exists():
                code = generate_code()
            
            # Create or get the subject
            subject, created = Subject.objects.get_or_create(
                name=subject_name,
                defaults={'code': code, 'year': year}
            )
            
            if created:
                print(f"  ✓ Created: {subject_name} ({code}) - Year {year}")
                created_count += 1
            else:
                # Update year if it exists but doesn't have year set
                if not hasattr(subject, 'year') or subject.year != year:
                    subject.year = year
                    subject.save()
                    print(f"  ↻ Updated: {subject_name} - Year {year}")
                else:
                    print(f"  - Already exists: {subject_name}")
                existing_count += 1
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Created: {created_count} subjects")
    print(f"  Already existed: {existing_count} subjects")
    print(f"  Total in database: {Subject.objects.count()} subjects")
    print(f"{'='*60}")

if __name__ == '__main__':
    populate_subjects()
