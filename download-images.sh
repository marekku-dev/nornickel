#!/usr/bin/env bash
# Запустить из папки с проектом: bash download-images.sh
set -e
mkdir -p img

download() {
  local url="$1"
  local name="$2"
  echo -n "  $name ... "
  curl -sL "$url" -o "img/$name" && echo "OK" || echo "FAIL"
}

download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170c9c5cd4785539dce53_logo.svg"                                                                         "logo.svg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a17ba8113234b1aa126456_905e6131e3b4753ccc0f4d918ba66e16_intro.jpg"                                     "hero-bg.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170c9c5cd4785539dce31_d2a685b3e2b66a5abfa74098890e06a9_graph.png"                                     "icon-scroll.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b12c4e9d2964b495260d86_52a9c0c266119b2694323e59d00c4e5e_graph-1.png"                                   "graph-1-temperature-history.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170c9c5cd4785539dce4b_2e95691c024e09a56b27a62ed14558ec_graph-2.png"                                   "graph-2-gases-desktop.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69baafc6fb4e1345c2488189_c649b6d8fbeffa26127ca5a475593c3d_graph-gas.png"                                 "graph-2-gases-mobile.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3985f74c255e8fa24587d_205bd596a07b7762f95d51680464249a_1.webp"                                       "weather-photo.webp"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b39860a81e211a8df45b53_c729e8d859453e917960375fde2f1ddf_2.webp"                                       "climate-photo.webp"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dce84_earth-1.jpg"                                                                    "earth-1.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dce92_earth-2.jpg"                                                                    "earth-2.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dceb2_earth-3.jpg"                                                                    "earth-3.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69ba880c92c42d2a96b0121c_2.jpg"                                                                          "earth-mobile-1.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69ba880ce3b64bf40f81a755_1.jpg"                                                                          "earth-mobile-2.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69ba880c22af86b2ccbc6237_3.jpg"                                                                          "earth-mobile-3.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bad8a3d8e092e0d57d8e2c_172b9f42bb677bd669acca4bbbc88504_Generated%20Image%20March%2018%2C%202026%20-%204_46PM.jpg" "cause-1.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bad8a34ac67a25283daecc_Generated%20Image%20March%2018%2C%202026%20-%204_49PM.jpg"                     "cause-2.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bad8a3c3376471dafba845_043e0660fb1fc3902495d759c882f03b_Generated%20Image%20March%2018%2C%202026%20-%204_52PM.jpg" "cause-3.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bb2ce70e7ee2668b12f5c9_4.jpg"                                                                          "cause-4.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bb2db8f250df932d8975af_5.jpg"                                                                          "cause-5.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3791a21fb0e7e2c9672fe_ai%2011.jpg"                                                                   "scientist-budyko.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3791a8fc0c80f1e6bbd61_ai%2013.jpg"                                                                   "scientist-khromov.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b379193b5d1e8e9dccadbd_ai%2010.jpg"                                                                   "scientist-voyeykov.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3791af0d7e3d3f924347b_ai%2012.jpg"                                                                   "scientist-alisov.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37919c2a4636dab6d52ce_ai%209.jpg"                                                                    "scientist-izrael.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b379194dbc248076509a48_ai%201.jpg"                                                                    "scientist-obukhov.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3791961d95c96635b8915_ai%202.jpg"                                                                    "scientist-mokhov.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37919c263a0751f06cf65_ai%207.jpg"                                                                    "scientist-golitsyn.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3791999f5b1265aa529e6_ai%206.jpg"                                                                    "scientist-gulyev.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37919fb7deacc2cf60c8f_ai%203.jpg"                                                                    "scientist-marchuk.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37919abca8068c8d3c6a7_ai%204.jpg"                                                                    "scientist-monin.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b3791994d480f855246c40_ai%205.jpg"                                                                    "scientist-lappo.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37919ccb2494596a7ac3f_ai%208.jpg"                                                                    "scientist-moiseev.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dcebe_image%2036.png"                                                                 "inst-rosgidromet.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dcec1_image%2037.png"                                                                 "inst-ifa.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dcec4_image%2038.png"                                                                 "inst-igke.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dcebc_image%2039.png"                                                                 "inst-ggo.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a170cac5cd4785539dceba_Vector.png"                                                                     "inst-mgu.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b125236f18668c468cc328_cropped-logo2color.png"                                                         "inst-ivm.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a17bf0a78f62eb2d544fc2_outro.jpg"                                                                      "outro-bg.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bc00aabf7151d4dc05c415_arrow-left.svg"                                                                 "arrow-left.svg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bc00aac77a48785f1e31ed_arrow-right.svg"                                                                "arrow-right.svg"

# ──────────────────────────────────────────
# ГЛАВА 2
# ──────────────────────────────────────────
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69a17bf0a78f62eb2d544fc2_outro.jpg"                                                                             "ch2-hero-bg.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bb996321bef16f7914a8cf_arctic.png"                                                                            "ch2-graph-arctic.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f1f6_b0496dc3b45b75cb5045d0213f6fb4d6_albedo.png"                                         "ch2-albedo.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b94af1170c9681101c22ce_efef30e1bcc30049e102bdd1d7ce4202_earth.gif"                                          "ch2-earth.gif"

# Карточки «Течения» (5 штук)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba8d6ccba79b294c3674e_6.jpg"                                                                                "ch2-current-1.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba8d57057efe6d27775e6_6a873efa44343b3e2891d6b909c15bb1_7.jpg"                                              "ch2-current-2.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba8d56d815eeb86cd4ce1_39ca0fb14c6398e09f66753dbfcd0d5e_8.jpg"                                              "ch2-current-3.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba8d5d31a21b512f0e679_9.jpg"                                                                                "ch2-current-4.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba8d592fdef1c9aac88c3_10.jpg"                                                                               "ch2-current-5.jpg"

# Батагайский кратер — хронология (12 снимков)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f20d_image%2043%20copy%201.jpg"                                                            "ch2-batagay-1962.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f211_image%2043%20copy%201-1.jpg"                                                          "ch2-batagay-1968.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f201_image%2043%20copy%201-2.jpg"                                                          "ch2-batagay-1975.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f205_image%2043%20copy%201-3.jpg"                                                          "ch2-batagay-1980.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f207_image%2043%20copy%201-4.jpg"                                                          "ch2-batagay-1991.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f203_image%2043%20copy%201-5.jpg"                                                          "ch2-batagay-1999.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f215_image%2043%20copy%201-6.jpg"                                                          "ch2-batagay-2002.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f213_image%2043%20copy%201-7.jpg"                                                          "ch2-batagay-2007.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f20f_image%2043%20copy%201-8.jpg"                                                          "ch2-batagay-2010.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f217_image%2043%20copy%201-9.jpg"                                                          "ch2-batagay-2013.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f209_image%2043%20copy%201-10.jpg"                                                         "ch2-batagay-2015.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f20b_image%2043%20copy%201-11.jpg"                                                         "ch2-batagay-2018.jpg"

# Before/after кратер
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b38175dde2c4b782e22587_%D0%BA%D1%80%D0%B0%D1%82%D0%B5%D1%80%201.jpg"                                       "ch2-crater-after.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b381757958dba931c34bcb_%D0%BA%D1%80%D0%B0%D1%82%D0%B5%D1%80%202.jpg"                                       "ch2-crater-before.jpg"

# Карточки «Экосистемы» (5 штук)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba633e2487b19d761a36b_1.jpg"                                                                                "ch2-eco-1.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba633b9308e65e55822ef_2.jpg"                                                                                "ch2-eco-2.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba6329e46f7b2e7d33cdc_3.jpg"                                                                                "ch2-eco-3.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba633f4803ce953b0e37e_4.jpg"                                                                                "ch2-eco-4.jpg"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69bba63330ac7d4f10775187_5.jpg"                                                                                "ch2-eco-5.jpg"

# Карта точек невозврата
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d3af9510b9dcb5ec8a819c_65f8afbb9248ed22ae17fa20677adbdf_map.webp"                                           "ch2-tipping-map.webp"

# Схема митигации и адаптации
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b37de6bacc0295b0d8f234_f2c1ce95979388df68e6da332e7a6632_image%2045.svg"                                     "ch2-adaptation.svg"

# Outro глава 2 (фон)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b29a28b44c4ba7549de01c_1711.jpeg"                                                                            "ch2-outro-bg.jpg"


# ─────────────────────────────────────────────────────────────
# ГЛАВА 3 — Как изменение климата влияет на экономику
# ─────────────────────────────────────────────────────────────

# Hero
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b29a28b44c4ba7549de01c_1711.jpeg"                                                                                                     "ch3-hero-bg.jpg"

# Инфографика — Альтернативная энергетика (SVG)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2c7b84011c624cf8c684e_%D0%90%D0%BB%D1%8C%D1%82%D0%B5%D1%80%D0%BD%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%B0%D1%8F%20%D1%8D%D0%BD%D0%B5%D1%80%D0%B3%D0%B5%D1%82%D0%B8%D0%BA%D0%B0.svg"  "ch3-energy-chart.svg"

# Полноэкранное фото — энергетика
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d93a69d828e27d34276f_b1a58f1811d0b1f29d0366aaafe9e75f_large-1%20copy.webp"                                                           "ch3-energy-photo.webp"

# Карточки транспорта (9 штук)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6f7a23594930289ffd_2a1d2f37960511a9908f6687547a09b7_image%2033.png"                                                                "ch3-transport-plane.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6e4e4d17c0dfcbe761_206d791cf756ecc888e8b0b4211bf3ba_image%2033-1.png"                                                              "ch3-transport-train.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6ed23f8cc59463af83_b0860b75a46c2a45cfc68c11d3d19b71_image%2033-2.png"                                                              "ch3-transport-ship.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6ead83a8f61485dd5a_ad5be4687304ccbab776c0d71e1692ae_image%2033-3.png"                                                              "ch3-transport-ferry.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6ea2fb60e736d0d929_acf32095fcbc9e715bf3eb0c3b7bc95b_image%2033-4.png"                                                              "ch3-transport-car.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6e10671687d517f2fa_ace9784db49496d5105265effbee2458_image%2033-5.png"                                                              "ch3-transport-ev.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6ed95771b7949b3847_593418283580f0dddbce1f29c6216491_image%2033-6.png"                                                              "ch3-transport-bus.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6ee3744e55a2d593e4_79e672e0b999517691ac1d2efa3e5b07_image%2033-7.png"                                                              "ch3-transport-bike.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2ca6e172268beb198bf8f_1a58e5641b7881c767b5886c98569d8f_image%2033-8.png"                                                              "ch3-transport-drone.png"

# Норникель — климатическая стратегия (SVG)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d6ad57af2ce480f24866_%D0%9F%D1%80%D0%B8%D0%BC%D0%B5%D1%80.svg"                                                                      "ch3-nornickel-climate.svg"

# Карточки углеродного следа предметов (5 штук, те же что и в section 10/11)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d77772ae6e8cacf1602b_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201.png"                                                  "ch3-footprint-bag-poly.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d778540fca64a98f038c_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-1.png"                                               "ch3-footprint-bag-paper.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d7787a23594930294044_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-2.png"                                               "ch3-footprint-coffee.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d7787d74a6529b30bef7_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-3.png"                                               "ch3-footprint-phone.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d778825fa5322e5106a8_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-4.png"                                               "ch3-footprint-burger.png"

# Полноэкранное фото — углеродная отчётность
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d95024a67d4331dde7f0_a77e35595d31690e0227f5200cca75fa_large-2%20copy.webp"                                                           "ch3-accounting-photo.webp"

# Таблица типов климатических проектов (SVG)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d388af951dd9f8919b56a8_table.svg"                                                                                                       "ch3-project-types.svg"

# Углеродные единицы (darken image, PNG)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2e3cfdb58e9a95632f87b_%D0%A3%D0%B3%D0%BB%D0%B5%D1%80%D0%BE%D0%B4%D0%BD%D1%8B%D0%B5%20%D0%B5%D0%B4%D0%B8%D0%BD%D0%B8%D1%86%D1%8B.png" "ch3-carbon-units.png"

# График — Сокращения выбросов парниковых газов (SVG)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2c7b81c8583513cdc64a3_%D0%A1%D0%BE%D0%BA%D1%80%D0%B0%D1%89%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%B2%D1%8B%D0%B1%D1%80%D0%BE%D1%81%D0%BE%D0%B2%20%D0%BF%D0%B0%D1%80%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2%D1%8B%D1%85%20%D0%B3%D0%B0%D0%B7%D0%BE%D0%B2.svg" "ch3-emissions-chart.svg"

# Карточки рыночных механизмов (используем те же footprint-изображения, что в section 5)
# (ch3-market-tax = ch3-footprint-bag-poly.png, etc. — одинаковые placeholder-изображения из Webflow)
# Копируем символически, так как Webflow использует одни и те же файлы
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d77772ae6e8cacf1602b_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201.png"                                                  "ch3-market-tax.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d778540fca64a98f038c_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-1.png"                                               "ch3-market-quota.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d7787a23594930294044_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-2.png"                                               "ch3-market-voluntary.png"

# Карточки Киото (те же placeholder-изображения)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d77772ae6e8cacf1602b_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201.png"                                                  "ch3-kyoto-1.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d778540fca64a98f038c_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-1.png"                                               "ch3-kyoto-2.png"
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2d7787a23594930294044_ChatGPT%20Image%20Dec%203%2C%202025%2C%2002_30_07%20PM%201-2.png"                                               "ch3-kyoto-3.png"

# График стоимости углеродных единиц (SVG)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69d2c7b82ea60beeaaed49b1_%D0%A1%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D1%83%D0%B3%D0%BB%D0%B5%D1%80%D0%BE%D0%B4%D0%BD%D1%8B%D1%85%20%D0%B5%D0%B4%D0%B8%D0%BD%D0%B8%D1%86.svg" "ch3-carbon-price.svg"

# Outro глава 3 (фон)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b29a477c3a161a4519848c_622f1c056e8d0.jpeg"                                                                                               "ch3-outro-bg.jpg"


# ─────────────────────────────────────────────────────────────
# ГЛАВА 4 — Как мир реагирует на изменение климата
# ─────────────────────────────────────────────────────────────

# Hero bg (тот же файл, что ch3-outro-bg, но сохраняем отдельно)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b29a477c3a161a4519848c_622f1c056e8d0.jpeg"                                                                                               "ch4-hero-bg.jpg"

# Outro bg (уникальный для гл. 4)
download "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b29a28bd96e522db0b66c5_39_%D0%9F%D0%9B%D0%90%D0%A2%D0%9E_%D0%9F%D0%A3%D0%A2%D0%9E%D0%A0%D0%90%D0%9D%D0%90_%D0%98%D0%AE%D0%9B%D0%AC_2022_%D0%94%D0%B5%D0%BD%D0%B8%D1%81%20%D0%93%D0%B0%D1%81%D1%8C%D0%BA%D0%BE%D0%B2.jpeg"  "ch4-outro-bg.jpg"

# Иконка скролла (SVG — для assets/scroll.svg)
mkdir -p assets
echo -n "  assets/scroll.svg ... "
curl -sL "https://cdn.prod.website-files.com/66d87d589c1f239397d2931b/69b2a4ec002f4b3acc9a8d15_icon__scroll.svg" -o "assets/scroll.svg" && echo "OK" || echo "FAIL"

# Фото: конференция в Киото (РКИК ООН)
download "https://www.figma.com/api/mcp/asset/36751bce-f9ba-473b-a833-a9d33335c336"    "ch4-unfccc-hall.jpg"

# Фото: подписание Парижского соглашения
download "https://www.figma.com/api/mcp/asset/b974c2ed-eed2-4cf0-a95c-2a0b3efb7a53"    "ch4-paris-signing.jpg"

# Инфографика: 17 целей ООН (SDG grid)
download "https://www.figma.com/api/mcp/asset/790a767d-2258-41b0-88ed-204f65164c89"    "ch4-sdg-grid.png"

# Инфографика: график CO₂ / МГЭИК
download "https://www.figma.com/api/mcp/asset/af2baded-04d2-4014-81c0-f67788065dd0"    "ch4-ipcc-graph.png"

# Карта CCPI 2025
download "https://www.figma.com/api/mcp/asset/fa66307a-12b6-4218-9d80-3ad1f3df5ea4"    "ch4-ccpi-map.png"

# Карточки «Лучшие мировые практики» (6 иллюстраций)
download "https://www.figma.com/api/mcp/asset/7c353e8b-43f3-49ec-b3df-407efeb89c70"    "ch4-practice-1.png"
download "https://www.figma.com/api/mcp/asset/c2668914-cd78-43e2-af69-c78bef9c5afa"    "ch4-practice-2.png"
download "https://www.figma.com/api/mcp/asset/7b3c37f6-5acf-4dde-b84a-900847fc2273"    "ch4-practice-3.png"
download "https://www.figma.com/api/mcp/asset/a5043533-a593-4116-b6de-9d4304faaf0c"    "ch4-practice-4.png"
download "https://www.figma.com/api/mcp/asset/a5043533-a593-4116-b6de-9d4304faaf0c"    "ch4-practice-5.png"
download "https://www.figma.com/api/mcp/asset/096b5de7-2e10-4bd2-ae43-2a932d6333f6"    "ch4-practice-6.png"

# Карта рисков России — 5 слоёв (нужно выгрузить из Figma вручную)
# Положи в img/ как:
#   ch4-russia-map-wind.png
#   ch4-russia-map-rain.png
#   ch4-russia-map-fire.png
#   ch4-russia-map-heat.png
#   ch4-russia-map-drought.png

echo ""
echo "Done. Files in img/:"
ls img/ | wc -l
