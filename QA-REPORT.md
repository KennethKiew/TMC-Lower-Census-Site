# QA — editorial demo v2

## Checked

- Local browser loaded the source demo and the self-contained HTML, including styles, fonts, images and five service accordions.
- Expanded Digital Mammography: available branch names showed Google Maps links; unavailable or ambiguous listings showed a pending note; Book Now was disabled with a Messenger destination note.
- Promo next control changed from slide 1 to slide 2. Reviewer option B opened the sample promotions page and Back returned to the homepage.
- Responsive checks at 360, 390 and 768 CSS pixels showed no horizontal document overflow and no broken images in the tested browser. A visual check confirmed the single-file demo displays the original editorial design.
- JavaScript files passed `node --check`.

## Still to verify

- Client confirmation of every branch-to-listing match, service availability, addresses, phone numbers, hours and coordinates. Some links are intentionally unavailable.
- Real-device mobile swipe, keyboard and screen-reader accessibility, and further desktop, device and browser coverage.
- Geolocation permission, success, denial and nearest-result accuracy on deployment; browser or OS permissions were not granted during this check.
- Actual external Google Maps destinations, Messenger link once supplied, live hosting and promotion content/expiry. This demo contains no backend or live booking system.
