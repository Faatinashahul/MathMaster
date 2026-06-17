import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="font-black text-xl text-gray-900">MathMaster</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wide">
            🎓 Built for Math Classrooms
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            The Smartest Way to<br />
            <span className="text-indigo-600">Teach & Learn Math</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Live quizzes, instant grading, attendance tracking, doubt solving, and gamified learning — all in one platform built for modern math classrooms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5">
              Get Started →
            </Link>
            <Link to="/login" className="bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
        </div>

      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">One platform. Every tool your math classroom needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Live Quiz Sessions', desc: 'Run real-time polls, quizzes, and word clouds. Students answer from their phones instantly.', color: 'bg-yellow-50 border-yellow-200' },
              { icon: '🤖', title: 'Auto Grading', desc: 'MCQ and numerical answers graded instantly. Only descriptive needs your attention.', color: 'bg-green-50 border-green-200' },
              { icon: '📊', title: 'Smart Analytics', desc: 'Track every student\'s progress, chapter-wise performance, and rank over time.', color: 'bg-blue-50 border-blue-200' },
              { icon: '🏆', title: 'Gamification', desc: 'XP points, levels, badges, and leaderboards keep students motivated and engaged.', color: 'bg-purple-50 border-purple-200' },
              { icon: '🎯', title: 'Attendance System', desc: 'Generate unique codes per class. Students mark attendance from their devices.', color: 'bg-red-50 border-red-200' },
              { icon: '💬', title: 'Doubt Forum', desc: 'Students post doubts with images. Teachers answer, resolve, and upvote the best questions.', color: 'bg-indigo-50 border-indigo-200' },
            ].map((f, i) => (
              <div key={i} className={`border rounded-2xl p-6 hover:shadow-md transition-shadow ${f.color}`}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Up and Running in Minutes</h2>
            <p className="text-gray-500 text-lg">No training needed. Simple for teachers, fun for students.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-indigo-600 font-black text-sm uppercase tracking-wide mb-4">For Teachers</div>
              {[
                ['1', 'Register as a teacher'],
                ['2', 'Create your first test with MCQ, descriptive, or numerical questions'],
                ['3', 'Publish it and watch students submit in real-time'],
                ['4', 'Launch a live quiz session from your phone or laptop'],
              ].map(([n, t]) => (
                <div key={n} className="flex items-start gap-4 mb-4 last:mb-0">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
                  <p className="text-gray-700 pt-1">{t}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-purple-600 font-black text-sm uppercase tracking-wide mb-4">For Students</div>
              {[
                ['1', 'Register with your student ID and batch'],
                ['2', 'Take tests, see results instantly, check your rank'],
                ['3', 'Join live sessions and answer polls from your phone'],
                ['4', 'Earn XP, unlock badges, climb the leaderboard'],
              ].map(([n, t]) => (
                <div key={n} className="flex items-start gap-4 mb-4 last:mb-0">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
                  <p className="text-gray-700 pt-1">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Loved by Teachers & Students</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', role: 'Math Teacher, Grade 10', text: 'The live quiz feature changed my classroom completely. Students are actually excited about math now!', avatar: 'P' },
              { name: 'Arjun Mehta', role: 'Student, Class 11', text: 'I love earning XP and seeing myself climb the leaderboard. Makes studying feel like a game.', avatar: 'A' },
              { name: 'Rekha Nair', role: 'HOD Mathematics', text: 'The analytics dashboard gives me a clear picture of every student\'s strengths and weaknesses.', avatar: 'R' },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
                <div className="text-yellow-400 mt-3 text-sm">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Transform Your Classroom?</h2>
          <p className="text-indigo-200 text-lg mb-8">Join thousands of teachers already using MathMaster.</p>
          <Link to="/register" className="bg-white text-indigo-600 font-black px-10 py-4 rounded-2xl text-lg hover:bg-indigo-50 transition-colors inline-block">
            Get Started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="font-bold text-white">MathMaster</span>
          </div>
          <p className="text-sm">© 2024 MathMaster. Built for math classrooms everywhere.</p>
          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
