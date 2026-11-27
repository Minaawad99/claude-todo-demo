# «عداد الكارت» — sources

## Facts (checked)
- Egyptian prepaid ("مسبوق الدفع") meters use a contact smart card (ISO 7816 chip). The charging centre writes the bought credit
  onto the card; inserting it moves the credit into the meter's own memory and clears it from the card, and the card carries the
  meter's readings and logged events (consumption, tamper such as an opened terminal cover) back to the company at the next charge.
  (EEHC / distribution-company guidance on prepaid meters; manufacturer manuals for single-phase IC-card prepayment meters.)
- Measurement: a manganin shunt in the phase line gives a voltage proportional to the current; a metering IC multiplies current by
  voltage and integrates the energy; the imp/kWh LED flashes once per fixed fraction of a kWh (meter constant on the nameplate).
- Billing: the meter holds the tariff table, converts kWh to money and deducts it from the balance; Egyptian residential tariffs are
  tiered per month (الشرائح), so the price per kWh rises with monthly use. Numbers in the video (5 A × 220 V = 1100 W) are an example.
- Cut-off: a latching relay on the phase line, driven by a short coil pulse from the microcontroller; it stays open with no power,
  and a reverse pulse closes it after new credit. A low-credit alarm (beep / warning LED) comes first.

## Shapes
- Photos of Egyptian single-phase IC-card prepaid meters (cream case, LCD, imp/kWh LED, alarm LED, card slot, sealed terminal cover,
  four cables), teardown photos of prepayment meters (shunt, metering IC, MCU, latching relay), latching-relay cut-away diagrams.
- No sound recordings beyond the shared «اسكتش» kit (videos/_templates/sketch/sfx/SOURCES.md).
