import { useState } from 'react'
import {
  HiOutlineCamera, HiOutlinePlusCircle, HiOutlineTrash,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineBadgeCheck,
  HiOutlineCode, HiOutlineGlobe, HiOutlinePhone,
} from 'react-icons/hi'
import { useAuth } from '../hooks/useAuth'
import { userService } from '../services/userService'
import { showToast } from '../components/common/Toast'
import { getInitials } from '../utils/helpers'
import SkillsInput from '../components/profile/SkillsInput'
import ResumeUpload from '../components/profile/ResumeUpload'
import ProfileCompletion from '../components/profile/ProfileCompletion'

const tabs = ['Basic Info', 'Skills & Resume', 'Education', 'Experience', 'Projects', 'Settings']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Basic Info')
  const [saving,    setSaving]    = useState(false)

  const [form, setForm] = useState({
    name:           user?.name || '',
    bio:            user?.bio || '',
    headline:       user?.headline || '',
    location:       user?.location || '',
    phone:          user?.phone || '',
    website:        user?.website || '',
    github:         user?.github || '',
    linkedin:       user?.linkedin || '',
    skills:         user?.skills || [],
    resume:         user?.resume || '',
    education:      user?.education || [],
    experience:     user?.experience || [],
    certifications: user?.certifications || [],
    projects:       user?.projects || [],
    emailAlerts:    user?.emailAlerts ?? true,
  })

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try {
      const data = await userService.updateProfile(form)
      updateUser(data.user)
      showToast.success('Profile updated!')
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const data = await userService.uploadAvatar(fd)
      updateUser({ avatar: data.avatarUrl })
      showToast.success('Photo updated!')
    } catch (err) {
      showToast.error(err.message)
    }
  }

  // Education helpers
  const addEducation    = () => set('education', [...form.education, { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' }])
  const updateEducation = (i, key, val) => { const arr = [...form.education]; arr[i][key] = val; set('education', arr) }
  const removeEducation = (i) => set('education', form.education.filter((_, idx) => idx !== i))

  // Experience helpers
  const addExperience    = () => set('experience', [...form.experience, { company: '', role: '', startDate: '', endDate: '', current: false, description: '' }])
  const updateExperience = (i, key, val) => { const arr = [...form.experience]; arr[i][key] = val; set('experience', arr) }
  const removeExperience = (i) => set('experience', form.experience.filter((_, idx) => idx !== i))

  // Project helpers
  const addProject    = () => set('projects', [...form.projects, { title: '', description: '', techStack: [], url: '', github: '' }])
  const updateProject = (i, key, val) => { const arr = [...form.projects]; arr[i][key] = val; set('projects', arr) }
  const removeProject = (i) => set('projects', form.projects.filter((_, idx) => idx !== i))

  return (
    <div className="section pt-8">
      <div className="container-app max-w-4xl px-4">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Keep this updated to get better job matches</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save all changes'}
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-0">
            {/* Avatar + name header */}
            <div className="card mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : getInitials(user?.name)
                    }
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-surface-800 rounded-full border border-surface-200 dark:border-surface-700 flex items-center justify-center cursor-pointer hover:bg-surface-50">
                    <HiOutlineCamera className="text-sm text-surface-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white text-lg">{user?.name}</p>
                  <p className="text-sm text-surface-400">{user?.email}</p>
                  <span className="badge-primary text-xs mt-1">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-surface-200 dark:border-surface-800 mb-4">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-surface-400 hover:text-surface-600'
                  }`}>{tab}</button>
              ))}
            </div>

            {/* Basic Info */}
            {activeTab === 'Basic Info' && (
              <div className="card space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full name</label>
                    <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Headline</label>
                    <input className="input" placeholder="e.g. Full Stack Developer | React | Node.js"
                      value={form.headline} onChange={e => set('headline', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea rows={3} className="input" placeholder="Tell recruiters about yourself..."
                    value={form.bio} onChange={e => set('bio', e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label"><HiOutlineGlobe className="inline mr-1" />Location</label>
                    <input className="input" placeholder="Delhi, India" value={form.location} onChange={e => set('location', e.target.value)} />
                  </div>
                  <div>
                    <label className="label"><HiOutlinePhone className="inline mr-1" />Phone</label>
                    <input className="input" placeholder="+91-9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">GitHub</label>
                    <input className="input" placeholder="github.com/username" value={form.github} onChange={e => set('github', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">LinkedIn</label>
                    <input className="input" placeholder="linkedin.com/in/username" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Skills & Resume */}
            {activeTab === 'Skills & Resume' && user?.role === 'student' && (
              <div className="card space-y-5">
                <div>
                  <label className="label">Your skills</label>
                  <SkillsInput value={form.skills} onChange={v => set('skills', v)} />
                </div>
                <ResumeUpload currentResume={form.resume} onUploaded={url => set('resume', url)} />
              </div>
            )}

            {/* Education */}
            {activeTab === 'Education' && (
              <div className="space-y-4">
                {form.education.map((edu, i) => (
                  <div key={i} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-600">
                        <HiOutlineAcademicCap />
                        <span className="text-sm font-semibold">Education {i + 1}</span>
                      </div>
                      <button onClick={() => removeEducation(i)} className="text-danger-500 hover:text-danger-600">
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Institution</label>
                        <input className="input" placeholder="XYZ University" value={edu.institution}
                          onChange={e => updateEducation(i, 'institution', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Degree</label>
                        <input className="input" placeholder="B.Tech / B.Sc / MCA" value={edu.degree}
                          onChange={e => updateEducation(i, 'degree', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Field of Study</label>
                        <input className="input" placeholder="Computer Science" value={edu.field}
                          onChange={e => updateEducation(i, 'field', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Grade / CGPA</label>
                        <input className="input" placeholder="8.5 CGPA / 85%" value={edu.grade}
                          onChange={e => updateEducation(i, 'grade', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Start Year</label>
                        <input type="number" className="input" placeholder="2020" value={edu.startYear}
                          onChange={e => updateEducation(i, 'startYear', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">End Year</label>
                        <input type="number" className="input" placeholder="2024" value={edu.endYear}
                          onChange={e => updateEducation(i, 'endYear', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addEducation} className="btn btn-outline w-full justify-center">
                  <HiOutlinePlusCircle /> Add Education
                </button>
              </div>
            )}

            {/* Experience */}
            {activeTab === 'Experience' && (
              <div className="space-y-4">
                {form.experience.map((exp, i) => (
                  <div key={i} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-600">
                        <HiOutlineBriefcase />
                        <span className="text-sm font-semibold">Experience {i + 1}</span>
                      </div>
                      <button onClick={() => removeExperience(i)} className="text-danger-500 hover:text-danger-600">
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Company</label>
                        <input className="input" placeholder="Google" value={exp.company}
                          onChange={e => updateExperience(i, 'company', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Role</label>
                        <input className="input" placeholder="Software Engineer" value={exp.role}
                          onChange={e => updateExperience(i, 'role', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Start Date</label>
                        <input type="month" className="input" value={exp.startDate}
                          onChange={e => updateExperience(i, 'startDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">End Date</label>
                        <input type="month" className="input" value={exp.endDate} disabled={exp.current}
                          onChange={e => updateExperience(i, 'endDate', e.target.value)} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} />
                      Currently working here
                    </label>
                    <div>
                      <label className="label">Description</label>
                      <textarea rows={2} className="input" placeholder="What did you build/achieve?"
                        value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button onClick={addExperience} className="btn btn-outline w-full justify-center">
                  <HiOutlinePlusCircle /> Add Experience
                </button>
              </div>
            )}

            {/* Projects */}
            {activeTab === 'Projects' && (
              <div className="space-y-4">
                {form.projects.map((proj, i) => (
                  <div key={i} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-600">
                        <HiOutlineCode />
                        <span className="text-sm font-semibold">Project {i + 1}</span>
                      </div>
                      <button onClick={() => removeProject(i)} className="text-danger-500 hover:text-danger-600">
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div>
                      <label className="label">Project Title</label>
                      <input className="input" placeholder="SkillMatch — Job Portal" value={proj.title}
                        onChange={e => updateProject(i, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <textarea rows={2} className="input" placeholder="What does this project do?"
                        value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Live URL</label>
                        <input className="input" placeholder="https://skillmatch.vercel.app" value={proj.url}
                          onChange={e => updateProject(i, 'url', e.target.value)} />
                      </div>
                      <div>
                        <label className="label">GitHub URL</label>
                        <input className="input" placeholder="github.com/user/repo" value={proj.github}
                          onChange={e => updateProject(i, 'github', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addProject} className="btn btn-outline w-full justify-center">
                  <HiOutlinePlusCircle /> Add Project
                </button>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'Settings' && (
              <div className="card space-y-4">
                <h3 className="font-semibold text-surface-900 dark:text-white">Notification Settings</h3>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Email notifications</p>
                    <p className="text-xs text-surface-400">Get notified about application updates via email</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('emailAlerts', !form.emailAlerts)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.emailAlerts ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </label>
              </div>
            )}

            <div className="mt-4">
              <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full justify-center">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {user?.role === 'student' && <ProfileCompletion user={{ ...user, ...form }} />}
          </div>
        </div>
      </div>
    </div>
  )
}
