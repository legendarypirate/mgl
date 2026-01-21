export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <img
                src="/superlogo.png"
                alt="Super deliv Logo"
                className="h-12 w-auto object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Super deliv
              </span>
            </div>
            <a
              href="/"
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Нүүр хуудас руу буцах
            </a>
          </div>
        </div>
      </nav>

      {/* Support Content */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4 pb-8 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  Дэмжлэг авах
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Бид танд туслахдаа баяртай байна. Асуулт, санал хүсэлтээ бидэнд илгээнэ үү.
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Холбоо барих</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Бидэнтэй холбогдох хэд хэдэн арга байна:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Утас</h3>
                      <a href="tel:94111440" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium">94111440</a>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Даваа - Баасан: 09:00 - 18:00</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Имэйл</h3>
                      <a href="mailto:info@superdeliv.mn" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium">info@superdeliv.mn</a>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">24 цагийн дотор хариу өгнө</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Хаяг</h3>
                      <p className="text-slate-700 dark:text-slate-300">Улаанбаатар хот, Монгол улс</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Оффис дээр ирэхээс өмнө урьдчилан залгана уу</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Түгээмэл асуултууд</h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Хүргэлтийн хугацаа хэд вэ?
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Хүргэлтийн хугацаа нь байршлаас хамаарч 30 минутаас 2 цаг хүртэл байна. Хот доторх хүргэлт ихэвчлэн 1 цагийн дотор хүргэгддэг.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Төлбөр хэрхэн төлөх вэ?
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Та бэлэн мөнгөөр эсвэл картаар төлбөр төлж болно. Хүргэлтийн үед төлбөр авах боломжтой.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Захиалгаа хэрхэн цуцлах вэ?
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Захиалгаа цуцлахыг хүсвэл утасны дугаараар залгаж эсвэл апп дээрх "Цуцлах" товчийг дараарай. Хүргэгч замд гарсан тохиолдолд цуцлалтын хураамж авч болно.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Хүргэлтийн статусыг хэрхэн мэдэх вэ?
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Та захиалгын дугаараа ашиглан апп эсвэл вэб хуудсан дээр хүргэлтийн статусыг шалгаж болно. Мөн танд мэдэгдэл илгээгдэх болно.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Асуудал гарвал хэнтэй холбогдох вэ?
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Асуудал гарвал дэмжлэгийн багтай утас эсвэл имэйлээр холбогдоно уу. Бид танд туслахдаа баяртай байна.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Get Help */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Тусламж авах</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-sm font-bold mt-1">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Асуудлаа тодорхойлох</h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Ямар асуудал гарсан бэ? Захиалга, төлбөр, хүргэлт эсвэл бусад асуудал уу?</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-sm font-bold mt-1">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Холбоо барих</h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Дээрх утас эсвэл имэйлээр холбогдоно уу. Захиалгын дугаар эсвэл холбогдох мэдээллийг бэлдэж байна уу.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-sm font-bold mt-1">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Шийдэл авах</h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Манай дэмжлэгийн баг танд туслах болно. Ихэвчлэн 24 цагийн дотор хариу өгнө.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ажлын цаг</h2>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Даваа - Баасан</span>
                      <span className="text-slate-700 dark:text-slate-300">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Бямба</span>
                      <span className="text-slate-700 dark:text-slate-300">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Ням</span>
                      <span className="text-slate-700 dark:text-slate-300">Амарна</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    Онцгой тохиолдолд 24/7 дэмжлэг үзүүлж болно.
                  </p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Бид таны санал хүсэлтийг хүлээн авч, сайжруулахад ажиллаж байна. Асуулт гарвал бидэнтэй холбогдоно уу.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Super deliv. Бүх эрх хуулиар хамгаалагдсан.</p>
        </div>
      </footer>
    </div>
  );
}

