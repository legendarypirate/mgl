export default function PrivacyPolicyPage() {
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

      {/* Privacy Policy Content */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4 pb-8 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  Нууцлалын бодлого
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Сүүлийн шинэчлэл: {new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Introduction */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1. Танилцуулга</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Super deliv нь таны хувийн мэдээллийг хамгаалах, хүндэтгэх үүднээс энэхүү нууцлалын бодлогыг боловсруулсан. Энэхүү бодлого нь манай компанид хэрхэн мэдээлэл цуглуулах, ашиглах, хадгалах, хуваалцах талаар тайлбарлана. Манай үйлчилгээг ашигласнаар та энэхүү бодлогыг хүлээн зөвшөөрч байна гэж үзнэ.
                </p>
              </div>

              {/* Information Collection */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">2. Цуглуулж буй мэдээлэл</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Бид танаас дараах мэдээллийг цуглуулж байна:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                  <li><strong>Хувийн мэдээлэл:</strong> Нэр, утасны дугаар, имэйл хаяг, хаяг</li>
                  <li><strong>Хүргэлтийн мэдээлэл:</strong> Хүргэлтийн хаяг, захиалгын дэлгэрэнгүй, төлбөрийн мэдээлэл</li>
                  <li><strong>Техникийн мэдээлэл:</strong> IP хаяг, төхөөрөмжийн мэдээлэл, хөтөч, үйл ажиллагааны систем</li>
                  <li><strong>Байршлын мэдээлэл:</strong> Хүргэлтийн байршлыг тодорхойлохын тулд GPS мэдээлэл</li>
                  <li><strong>Холбоо барих түүх:</strong> Манай дэмжлэгийн багтай хийсэн харилцааны түүх</li>
                </ul>
              </div>

              {/* Use of Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">3. Мэдээллийн ашиглалт</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Бид цуглуулсан мэдээллийг дараах зорилгоор ашиглаж байна:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                  <li>Хүргэлтийн үйлчилгээг үзүүлэх, захиалгыг боловсруулах</li>
                  <li>Хүргэгчидтэй холбоо барих, хүргэлтийн байршлыг тодорхойлох</li>
                  <li>Төлбөрийн үйл явцыг боловсруулах</li>
                  <li>Үйлчилгээний чанарыг сайжруулах, шинэ үйлчилгээ нэвтрүүлэх</li>
                  <li>Хууль ёсны шаардлагад нийцүүлэх</li>
                  <li>Маркетингийн зорилгоор (зөвхөн таны зөвшөөрөлтэй)</li>
                  <li>Аюулгүй байдлыг хангах, хууль бус үйл ажиллагааг илрүүлэх</li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">4. Мэдээллийн хуваалцалт</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Бид таны хувийн мэдээллийг дараах тохиолдолд хуваалцаж болно:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                  <li><strong>Хүргэгчид:</strong> Хүргэлт хийхэд шаардлагатай мэдээлэл (хаяг, утасны дугаар)</li>
                  <li><strong>Үйлчилгээний түншүүд:</strong> Үйлчилгээ үзүүлэхэд шаардлагатай тохиолдолд</li>
                  <li><strong>Хууль ёсны шаардлага:</strong> Хууль, шүүх захиалга, засгийн газрын шаардлагад нийцүүлэх</li>
                  <li><strong>Бизнесийн шилжилт:</strong> Худалдах, нэгдэх, нэгтгэх тохиолдолд</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  Бид таны мэдээллийг зөвхөн дээрх зорилгоор ашиглах, шаардлагагүй тохиолдолд гуравдагч этгээдэд хуваалцахгүй.
                </p>
              </div>

              {/* Data Security */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">5. Мэдээллийн аюулгүй байдал</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Бид таны мэдээллийг хамгаалахын тулд техникийн болон зохион байгуулалтын арга хэмжээ авч байна:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                  <li>SSL/TLS шифрлэлт ашиглан мэдээлэл дамжуулах</li>
                  <li>Аюулгүй сервер дээр мэдээлэл хадгалах</li>
                  <li>Хандах эрхийг хязгаарлах, хянах</li>
                  <li>Тогтмол аюулгүй байдлын үнэлгээ хийх</li>
                  <li>Ажилтнуудад мэдээллийн аюулгүй байдлын сургалт зохион байгуулах</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  Гэхдээ интернэтээр дамжуулах мэдээлэл 100% аюулгүй байхыг хангах боломжгүй гэдгийг анхаарна уу.
                </p>
              </div>

              {/* Data Retention */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">6. Мэдээллийн хадгалалтын хугацаа</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Бид таны мэдээллийг үйлчилгээ үзүүлэх, хууль ёсны шаардлагад нийцүүлэхэд шаардлагатай хугацаанд хадгална. Хэрэв та бүртгэлээ устгахыг хүсвэл, бид хууль ёсны шаардлагад нийцүүлэн мэдээллийг устгана.
                </p>
              </div>

              {/* User Rights */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">7. Таны эрх</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Та дараах эрхтэй:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                  <li>Өөрийн хувийн мэдээллийг харах, засах эрх</li>
                  <li>Мэдээллийг устгах хүсэлт гаргах эрх</li>
                  <li>Мэдээлэл цуглуулах, ашиглахыг хязгаарлах эрх</li>
                  <li>Мэдээллийг шилжүүлэх эрх</li>
                  <li>Маркетингийн мэдээлэл хүлээн авахаас татгалзах эрх</li>
                  <li>Эсэргүүцэл гаргах эрх</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  Эдгээр эрхээ ашиглахыг хүсвэл бидэнтэй холбогдоно уу.
                </p>
              </div>

              {/* Cookies */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">8. Cookie болон ижил төстэй технологи</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Бид таны туршлагыг сайжруулахын тулд cookie болон ижил төстэй технологи ашиглаж байна. Cookie нь таны төхөөрөмж дээр хадгалагдсан жижиг файлууд бөгөөд таны хөтөч дээр cookie-г идэвхгүй болгож болно. Гэхдээ зарим үйлчилгээг ашиглахад cookie шаардлагатай байж болно.
                </p>
              </div>

              {/* Third Party Services */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">9. Гуравдагч этгээдийн үйлчилгээ</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Манай үйлчилгээ нь төлбөрийн боловсруулагч, аналитик үйлчилгээ зэрэг гуравдагч этгээдийн үйлчилгээг ашиглаж байж болно. Эдгээр компаниуд өөрсдийн нууцлалын бодлоготой байдаг бөгөөд бид тэдний үйл ажиллагаанд хариуцлага хүлээхгүй.
                </p>
              </div>

              {/* Children Privacy */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">10. Хүүхдийн нууцлал</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Манай үйлчилгээ нь 18-аас доош насны хүүхдүүдэд зориулагдаагүй. Бид санаатайгаар хүүхдийн хувийн мэдээллийг цуглуулдаггүй. Хэрэв та хүүхдийн мэдээлэл цуглуулж байгааг анзаарвал бидэнтэй холбогдоно уу.
                </p>
              </div>

              {/* Policy Changes */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">11. Бодлогын өөрчлөлт</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Бид энэхүү нууцлалын бодлогыг цаг үеийн хэрэгцээнд нийцүүлэн шинэчлэх эрхтэй. Бодлогод томоохон өөрчлөлт оруулах тохиолдолд бид танд мэдэгдэх болно. Бодлогын шинэчлэлтийг энэ хуудас дээр тусгана.
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">12. Холбоо барих</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Нууцлалын бодлоготой холбоотой асуулт, санал хүсэлт, эсэргүүцэл гаргахыг хүсвэл дараах хаягаар холбогдоно уу:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Утас:</span>
                    <a href="tel:94111440" className="text-blue-600 dark:text-blue-400 hover:underline">94111440</a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Имэйл:</span>
                    <a href="mailto:info@superdeliv.mn" className="text-blue-600 dark:text-blue-400 hover:underline">info@superdeliv.mn</a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Компани:</span>
                    <span className="text-slate-700 dark:text-slate-300">Super deliv</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Энэхүү нууцлалын бодлогыг уншиж, ойлгосон гэж үзнэ. Асуулт гарвал бидэнтэй холбогдоно уу.
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

