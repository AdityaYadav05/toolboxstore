import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Edit3, Plus, Trash2, User, Mail, Phone, MapPin, Globe, Award, Briefcase, GraduationCap, Book, Star, Save, Printer } from 'lucide-react';

const ResumeBuilder = () => {
  const [resume, setResume] = useState({
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      address: 'New York, NY',
      website: 'johndoeportfolio.com',
      summary: 'Experienced software developer with 5+ years in web development. Passionate about creating efficient and scalable applications using modern technologies.'
    },
    workExperience: [
      {
        id: 1,
        company: 'Tech Solutions Inc.',
        position: 'Senior Developer',
        startDate: '2020-03',
        endDate: '2023-12',
        current: false,
        description: 'Led development of web applications using React and Node.js. Managed team of 4 developers and improved application performance by 40%.'
      },
      {
        id: 2,
        company: 'Digital Innovations',
        position: 'Frontend Developer',
        startDate: '2018-06',
        endDate: '2020-02',
        current: false,
        description: 'Developed responsive web applications and collaborated with design team to implement user-friendly interfaces.'
      }
    ],
    education: [
      {
        id: 1,
        institution: 'University of Technology',
        degree: 'Bachelor of Science in Computer Science',
        startDate: '2014-09',
        endDate: '2018-05',
        current: false,
        gpa: '3.8'
      }
    ],
    skills: [
      { id: 1, name: 'JavaScript', level: 90 },
      { id: 2, name: 'React', level: 85 },
      { id: 3, name: 'Node.js', level: 80 },
      { id: 4, name: 'Python', level: 75 },
      { id: 5, name: 'SQL', level: 85 },
      { id: 6, name: 'Git', level: 90 }
    ],
    projects: [
      {
        id: 1,
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with React frontend and Node.js backend',
        technologies: 'React, Node.js, MongoDB, Stripe',
        link: 'https://github.com/johndoe/ecommerce'
      },
      {
        id: 2,
        name: 'Task Management App',
        description: 'Collaborative project management tool with real-time updates',
        technologies: 'Vue.js, Firebase, Tailwind CSS',
        link: 'https://github.com/johndoe/taskapp'
      }
    ],
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2022-06',
        link: 'https://aws.amazon.com/certification'
      },
      {
        id: 2,
        name: 'React Professional Certificate',
        issuer: 'Meta',
        date: '2021-03',
        link: 'https://coursera.org'
      }
    ],
    languages: [
      { id: 1, name: 'English', level: 'Native' },
      { id: 2, name: 'Spanish', level: 'Intermediate' }
    ]
  });

  const [templates, setTemplates] = useState([
    { id: 'professional', name: 'Professional', color: 'blue' },
    { id: 'modern', name: 'Modern', color: 'purple' },
    { id: 'creative', name: 'Creative', color: 'green' }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [savedResumes, setSavedResumes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  // Initialize data
  useEffect(() => {
    const savedResumeData = localStorage.getItem('resumeData');
    const savedResumesData = localStorage.getItem('savedResumes');
    
    if (savedResumeData) {
      setResume(JSON.parse(savedResumeData));
    }
    
    if (savedResumesData) {
      setSavedResumes(JSON.parse(savedResumesData));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resume));
    localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
  }, [resume, savedResumes]);

  // Update personal info
  const updatePersonalInfo = (field, value) => {
    setResume(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Add item to section
  const addItem = (section) => {
    const newItem = getDefaultItem(section);
    setResume(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  // Update item in section
  const updateItem = (section, id, field, value) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Remove item from section
  const removeItem = (section, id) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  // Get default item for section
  const getDefaultItem = (section) => {
    const defaults = {
      workExperience: {
        id: Date.now(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      },
      education: {
        id: Date.now(),
        institution: '',
        degree: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: ''
      },
      skills: {
        id: Date.now(),
        name: '',
        level: 50
      },
      projects: {
        id: Date.now(),
        name: '',
        description: '',
        technologies: '',
        link: ''
      },
      certifications: {
        id: Date.now(),
        name: '',
        issuer: '',
        date: '',
        link: ''
      },
      languages: {
        id: Date.now(),
        name: '',
        level: 'Beginner'
      }
    };
    return defaults[section];
  };

  // Save resume
  const saveResume = () => {
    const newSavedResume = {
      id: Date.now(),
      name: `${resume.personalInfo.firstName} ${resume.personalInfo.lastName} - Resume`,
      timestamp: new Date().toISOString(),
      data: { ...resume }
    };
    
    setSavedResumes(prev => [newSavedResume, ...prev.slice(0, 4)]);
    alert('Resume saved successfully!');
  };

  // Load resume
  const loadResume = (savedResume) => {
    setResume(savedResume.data);
    alert(`Loaded resume: ${savedResume.name}`);
  };

  // Delete saved resume
  const deleteSavedResume = (id) => {
    setSavedResumes(prev => prev.filter(resume => resume.id !== id));
  };

  // Generate PDF (mock implementation)
  const generatePDF = () => {
    const resumeContent = document.getElementById('resume-preview');
    alert('PDF generation would be implemented here. This is a preview of your resume.');
    
    // Print functionality
    const originalContents = document.body.innerHTML;
    const printContents = resumeContent.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Get skill level color
  const getSkillLevelColor = (level) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate experience duration
  const calculateDuration = (startDate, endDate, current) => {
    if (!startDate) return '';
    
    const start = new Date(startDate + '-01');
    const end = current ? new Date() : new Date(endDate + '-01');
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let duration = '';
    if (years > 0) duration += `${years} yr${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0) duration += `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    
    return duration.trim();
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Resume Builder</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Resume Sections */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Templates</h3>
            </div>
            <div className="p-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                    selectedTemplate === template.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-${template.color}-500`}></div>
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Resume Sections */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Sections</h3>
            </div>
            <div className="p-2">
              {[
                { id: 'personal', name: 'Personal Info', icon: User },
                { id: 'work', name: 'Work Experience', icon: Briefcase },
                { id: 'education', name: 'Education', icon: GraduationCap },
                { id: 'skills', name: 'Skills', icon: Star },
                { id: 'projects', name: 'Projects', icon: Book },
                { id: 'certifications', name: 'Certifications', icon: Award },
                { id: 'languages', name: 'Languages', icon: Globe }
              ].map(section => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === section.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={16} />
                    {section.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={saveResume}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save size={16} />
                Save Resume
              </button>
              <button
                onClick={generatePDF}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button
                onClick={generatePDF}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Printer size={16} />
                Print Resume
              </button>
            </div>
          </div>

          {/* Saved Resumes */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Saved Resumes</h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {savedResumes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No saved resumes
                </div>
              ) : (
                savedResumes.map(savedResume => (
                  <div key={savedResume.id} className="p-3 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-gray-800 text-sm truncate">
                        {savedResume.name}
                      </div>
                      <button
                        onClick={() => deleteSavedResume(savedResume.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => loadResume(savedResume)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Load
                      </button>
                      <span className="text-xs text-gray-500">
                        {new Date(savedResume.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 capitalize">
                {activeSection === 'personal' ? 'Personal Information' : 
                 activeSection === 'work' ? 'Work Experience' : 
                 activeSection.replace(/([A-Z])/g, ' $1')}
              </h3>
            </div>

            <div className="p-6 max-h-[600px] overflow-y-auto">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={resume.personalInfo.firstName}
                        onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={resume.personalInfo.lastName}
                        onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="email"
                          value={resume.personalInfo.email}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="tel"
                          value={resume.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={resume.personalInfo.address}
                        onChange={(e) => updatePersonalInfo('address', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website/Portfolio
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="url"
                        value={resume.personalInfo.website}
                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Professional Summary
                    </label>
                    <textarea
                      value={resume.personalInfo.summary}
                      onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Brief overview of your professional background and skills..."
                    />
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {activeSection === 'work' && (
                <div className="space-y-6">
                  {resume.workExperience.map((job, index) => (
                    <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Experience #{index + 1}</h4>
                        <button
                          onClick={() => removeItem('workExperience', job.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={job.company}
                            onChange={(e) => updateItem('workExperience', job.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Position
                          </label>
                          <input
                            type="text"
                            value={job.position}
                            onChange={(e) => updateItem('workExperience', job.id, 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            value={job.startDate}
                            onChange={(e) => updateItem('workExperience', job.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={job.endDate}
                            onChange={(e) => updateItem('workExperience', job.id, 'endDate', e.target.value)}
                            disabled={job.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={job.current}
                              onChange={(e) => updateItem('workExperience', job.id, 'current', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Current Job</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={job.description}
                          onChange={(e) => updateItem('workExperience', job.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('workExperience')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Work Experience
                  </button>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div className="space-y-6">
                  {resume.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Education #{index + 1}</h4>
                        <button
                          onClick={() => removeItem('education', edu.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Institution
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)}
                            disabled={edu.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            GPA
                          </label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            placeholder="3.8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('education')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Education
                  </button>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div className="space-y-6">
                  {resume.skills.map((skill, index) => (
                    <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Skill #{index + 1}</h4>
                        <button
                          onClick={() => removeItem('skills', skill.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Skill Name
                          </label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Proficiency Level: {skill.level}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={skill.level}
                            onChange={(e) => updateItem('skills', skill.id, 'level', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full ${getSkillLevelColor(skill.level)}`}
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem('skills')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Skill
                  </button>
                </div>
              )}

              {/* Add similar editors for Projects, Certifications, Languages */}
              {['projects', 'certifications', 'languages'].includes(activeSection) && (
                <div className="space-y-6">
                  {resume[activeSection].map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">
                          {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)} #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeItem(activeSection, item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.keys(item).map(key => {
                          if (key === 'id') return null;
                          
                          return (
                            <div key={key}>
                              <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </label>
                              {key === 'description' ? (
                                <textarea
                                  value={item[key]}
                                  onChange={(e) => updateItem(activeSection, item.id, key, e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                />
                              ) : (
                                <input
                                  type={key === 'date' ? 'month' : key === 'link' ? 'url' : 'text'}
                                  value={item[key]}
                                  onChange={(e) => updateItem(activeSection, item.id, key, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem(activeSection)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div id="resume-preview" className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="text-blue-600" />
              Preview
            </h3>
            
            {/* Professional Template */}
            {selectedTemplate === 'professional' && (
              <div className="space-y-6 text-sm">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-4">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {resume.personalInfo.firstName} {resume.personalInfo.lastName}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-4 mt-2 text-gray-600">
                    {resume.personalInfo.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {resume.personalInfo.email}
                      </span>
                    )}
                    {resume.personalInfo.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {resume.personalInfo.phone}
                      </span>
                    )}
                    {resume.personalInfo.website && (
                      <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {resume.personalInfo.website}
                      </span>
                    )}
                  </div>
                  {resume.personalInfo.address && (
                    <div className="mt-1 text-gray-600 flex items-center justify-center gap-1">
                      <MapPin size={12} />
                      {resume.personalInfo.address}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {resume.personalInfo.summary && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {resume.personalInfo.summary}
                    </p>
                  </div>
                )}

                {/* Work Experience */}
                {resume.workExperience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Work Experience
                    </h2>
                    <div className="space-y-4">
                      {resume.workExperience.map(job => (
                        <div key={job.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-800">{job.position}</h3>
                              <div className="text-gray-600">{job.company}</div>
                            </div>
                            <div className="text-right text-gray-600 text-xs">
                              <div>{formatDate(job.startDate)} - {job.current ? 'Present' : formatDate(job.endDate)}</div>
                              <div>{calculateDuration(job.startDate, job.endDate, job.current)}</div>
                            </div>
                          </div>
                          {job.description && (
                            <p className="mt-1 text-gray-700 text-xs leading-relaxed">
                              {job.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.education.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {resume.education.map(edu => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                              <div className="text-gray-600">{edu.institution}</div>
                            </div>
                            <div className="text-right text-gray-600 text-xs">
                              <div>{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</div>
                              {edu.gpa && <div>GPA: {edu.gpa}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resume.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map(skill => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resume.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Projects
                    </h2>
                    <div className="space-y-3">
                      {resume.projects.map(project => (
                        <div key={project.id}>
                          <h3 className="font-semibold text-gray-800">{project.name}</h3>
                          {project.description && (
                            <p className="text-gray-700 text-xs mt-1">{project.description}</p>
                          )}
                          {project.technologies && (
                            <div className="text-gray-600 text-xs mt-1">
                              <strong>Technologies:</strong> {project.technologies}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resume.certifications.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Certifications
                    </h2>
                    <div className="space-y-2">
                      {resume.certifications.map(cert => (
                        <div key={cert.id}>
                          <div className="font-semibold text-gray-800">{cert.name}</div>
                          <div className="text-gray-600 text-xs">{cert.issuer} • {formatDate(cert.date)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {resume.languages.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                      Languages
                    </h2>
                    <div className="space-y-1">
                      {resume.languages.map(lang => (
                        <div key={lang.id} className="flex justify-between">
                          <span className="text-gray-700">{lang.name}</span>
                          <span className="text-gray-600 text-xs">{lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <FileText className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Professional Templates</div>
          <div className="text-sm text-gray-600">Multiple design options</div>
        </div>
        <div className="text-center p-4">
          <Edit3 className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Easy Editing</div>
          <div className="text-sm text-gray-600">Real-time updates</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Export PDF</div>
          <div className="text-sm text-gray-600">Download and print</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Save & Load</div>
          <div className="text-sm text-gray-600">Multiple resume versions</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Resume Building Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use action verbs and quantify achievements (e.g., "Increased performance by 40%")</li>
          <li>• Tailor your resume for each job application by emphasizing relevant skills</li>
          <li>• Keep your resume concise - aim for 1-2 pages maximum</li>
          <li>• Use a clean, professional layout that's easy to scan quickly</li>
          <li>• Include keywords from the job description to pass automated screening systems</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeBuilder;
