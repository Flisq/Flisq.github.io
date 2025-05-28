document.addEventListener('DOMContentLoaded', function () {
    // === UTILITY FUNCTIONS ===
    const parseSafe = (val, def = 0, min = null, max = null) => {
        let num = parseFloat(val);
        if (isNaN(num)) num = def;
        if (min !== null) num = Math.max(min, num);
        if (max !== null) num = Math.min(max, num);
        return num;
    };

    const syncSliderInput = (slider, input, def, min, max, onChange) => {
        if (!slider || !input) return;

        slider.addEventListener('input', () => {
            input.value = slider.value;
            onChange();
        });

        input.addEventListener('input', () => {
            onChange();
        });

        const validateAndUpdate = () => {
            let val = parseSafe(input.value, def, min, max);
            input.value = val;
            slider.value = val;
            onChange();
        };

        input.addEventListener('blur', validateAndUpdate);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                validateAndUpdate();
                input.blur();
            }
        });
    };
    // Przełączanie paneli trybu
    document.querySelectorAll('input[name="modeType"]').forEach(el => {
      el.addEventListener('change', function () {
        const isB2B = this.value === 'B2B';
        const isUOP = this.value === 'UOP';

        document.getElementById('uopPanel').classList.toggle('d-none', !isUOP);
        document.getElementById('b2bPanel').classList.toggle('d-none', !isB2B);
        document.getElementById('summaryPanels').classList.remove('d-none');
        document.getElementById('chartPanelUOP').classList.toggle('d-none', !isUOP);
        document.getElementById('chartPanelB2B').classList.toggle('d-none', !isB2B);
        document.getElementById('costsSummaryYearRow').classList.toggle('d-none', !isB2B);
        document.getElementById('vatSummaryYearRow').classList.toggle('d-none', !isB2B);

        document.getElementById('b2bVatCheckbox')?.addEventListener('change', updateSummaryB2B);

        updatePanels();
      });
    });

    const formatCurrency = (val) => `${val.toFixed(2)} PLN`;

    const el = (id) => document.getElementById(id);

    // Helper do aktualizacji panelu testowego
    const setDebugText = (id, value) => {
        const element = el(id);
        if (element) {
            if (typeof value === 'number') {
                element.innerText = value.toFixed(2);
            } else if (typeof value === 'boolean') {
                element.innerText = value ? 'Tak' : 'Nie';
            } else {
                element.innerText = value;
            }
        }
    };

    const invoiceInput = el('invoice');
    const invoiceManual = el('invoiceManual');
    const invoiceValue = el('invoiceValue');
    const taxSelect = el('tax');
    const zusSelect = el('zus');
    const inputTypeInvoice = el('inputInvoice');
    const inputTypeHourly = el('inputHourly');
    const invoiceInputGroup = el('invoiceInputGroup');
    const hourlyInputGroup = el('hourlyInputGroup');
    const hourlyRateSlider = el('hourlyRateSlider');
    const hourlyRateInput = el('hourlyRate');
    const hourlyRateValue = el('hourlyRateValue');
    const hoursPerMonthInput = el('hoursPerMonth');
    const under26Checkbox = el('under26');
    const remoteWorkCheckbox = el('remoteWork');
    const spouseCheckbox = el('spouse');
    const ppkCheckbox = el('PPK');
    const kupCheckbox = el('kupCheckbox');
    const kupSlider = el('kupSlider');
    const kupInput = el('kupInput');
    const ppkEmployeeSlider = el('ppkEmployeeSlider');
    const ppkEmployeeInput = el('ppkEmployeeInput');
    const ppkEmployerSlider = el('ppkEmployerSlider');
    const ppkEmployerInput = el('ppkEmployerInput');
    const studentCheckbox = el('student');
    const spouseIncomeSlider = el('spouseIncomeSlider');
    const spouseIncomeInput = el('spouseIncomeInput');
    const spouseTaxType = el('spouseTaxType');

    const nettoSummary = el('nettoSummary');
    const taxSummary = el('taxSummary');
    const zusSummary = el('zusSummary');
    const finalSummary = el('finalSummary');
    const zusRetirementSummary = el('zusRetirementSummary');
    const zusDisabilitySummary = el('zusDisabilitySummary');
    const zusSicknessSummary = el('zusSicknessSummary');
    const zusHealthSummary = el('zusHealthSummary');
    const nettoSummaryYear = el('nettoSummaryYear');
    const taxSummaryYear = el('taxSummaryYear');
    const zusSummaryYear = el('zusSummaryYear');
    const finalSummaryYear = el('finalSummaryYear');
    const taxChartMonth = el('taxChartMonth');
    const taxChartMonthB2B = el('taxChartMonthB2B');

    // B2B elements
    const inputTypeInvoiceB2B = el('inputInvoiceB2B');
    const inputTypeHourlyB2B = el('inputHourlyB2B');
    const invoiceInputGroupB2B = el('invoiceInputGroupB2B');
    const hourlyInputGroupB2B = el('hourlyInputGroupB2B');
    const invoiceInputB2B = el('invoiceB2B');
    const invoiceManualB2B = el('invoiceManualB2B');
    const invoiceValueB2B = el('invoiceValueB2B');
    const hourlyRateSliderB2B = el('hourlyRateSliderB2B');
    const hourlyRateInputB2B = el('hourlyRateB2B');
    const hourlyRateValueB2B = el('hourlyRateValueB2B');
    const hoursPerMonthInputB2B = el('hoursPerMonthB2B');
    const b2bTaxType = el('b2bTaxType');
    const b2bVatType = el('b2bVatType');
    const b2bVatTypeCosts = el('b2bVatTypeCosts');
    const b2bZusType = el('b2bZusType');
    const b2bChorobowe = el('b2bChorobowe');
    const b2bKoszty = el('b2bKoszty');
    const spouseB2B = document.getElementById('spouseB2B');
    const spouseOptionsGroupB2B = document.getElementById('spouseOptionsGroupB2B');
    const b2bKosztyValueGroup = document.getElementById('b2bKosztyValueGroup');
    const b2bKosztyValue = el('b2bKosztyValue');
    const b2bVatTypeUnderKoszty = document.getElementById('b2bVatTypeUnderKoszty');
    const spouseIncomeInputB2B = el('spouseIncomeInputB2B');
    const spouseTaxTypeB2B = el('spouseTaxTypeB2B');


    function getInvoiceValue() {
        if (inputTypeInvoice.checked) {
            return parseSafe(invoiceManual.value, 15000, 5000, 30000);
        } else {
            // min 31, max 300 dla UOP
            return parseSafe(hourlyRateInput.value, 100, 31, 300) * parseSafe(hoursPerMonthInput.value, 160, 1, 720);
        }
    }

    // Stałe do obliczeń ZUS (2024)
    const ZUS_CONST = {
        full: {
            retirementRate: 0.0976,   // emerytalna
            disabilityRate: 0.015,     // rentowa
            sicknessRate: 0.0245,     // chorobowa
            healthRate: 0.09,         // zdrowotna (przykład, uproszczone)
        },
        exempt: {
            retirementRate: 0,
            disabilityRate: 0,
            sicknessRate: 0,
            healthRate: 0,
        }
    };

    function calculateZUS(type) {
        const zus = ZUS_CONST[type] || ZUS_CONST.full;
        const invoice = getInvoiceValue();
        const retirement = Math.min(2116,(invoice * zus.retirementRate));
        const disability = Math.min(325,(invoice * zus.disabilityRate));
        const sickness = invoice * zus.sicknessRate;
        let healthBase = invoice - retirement - sickness - disability;
        const health = healthBase * zus.healthRate;
        return {
            retirement,
            disability,
            sickness,
            health,
            total: retirement + disability + sickness + health,
            totalWithoutHealth: retirement + disability + sickness
        };
    }

    function updateSummary() {
        const invoice = getInvoiceValue();
        const isStudent = studentCheckbox?.checked;
        const zusType = isStudent ? 'exempt' : 'full';
        const kupPercent = kupCheckbox?.checked ? parseSafe(kupInput?.value, 0) : 0;
        const isUnder26 = under26Checkbox?.checked;

        let remoteWorkDeduction = remoteWorkCheckbox?.checked ? 250 : 300;
        let ppkEmployeePercent = ppkCheckbox?.checked ? parseSafe(ppkEmployeeInput?.value, 2) : 0;

        const zusCalc = calculateZUS(zusType);
        const ppkEmployeeAmount = invoice * (ppkEmployeePercent / 100);
        
        const incomeBase = invoice - zusCalc.totalWithoutHealth;
        const kupAmount = incomeBase * (kupPercent / 100) * 0.5; // Autorskie KUP 50%
        
        let monthlyTaxBase = invoice - kupAmount - remoteWorkDeduction - zusCalc.totalWithoutHealth;
        let annualTaxBase = monthlyTaxBase * 12;

        let annualTaxAmount = 0;
        const taxThreshold = 120000;
        const taxFreeAmountDeduction = 3600; // Kwota zmniejszająca podatek

        if (isUnder26) {
            annualTaxAmount = 0;
        } else {
            if (annualTaxBase <= taxThreshold) {
                annualTaxAmount = (annualTaxBase * 0.12) - taxFreeAmountDeduction;
            } else {
                annualTaxAmount = 10800 + ((annualTaxBase - taxThreshold) * 0.32);
            }
        }

        annualTaxAmount = Math.max(0, annualTaxAmount);
        const taxAmountMonthly = annualTaxAmount / 12;
        const finalPay = invoice - taxAmountMonthly - zusCalc.total - ppkEmployeeAmount;

        nettoSummary.innerText = formatCurrency(invoice);
        taxSummary.innerText = formatCurrency(taxAmountMonthly);
        zusSummary.innerText = formatCurrency(zusCalc.total);
        finalSummary.innerText = formatCurrency(finalPay);
        zusRetirementSummary.innerText = formatCurrency(zusCalc.retirement);
        zusDisabilitySummary.innerText = formatCurrency(zusCalc.disability);
        zusSicknessSummary.innerText = formatCurrency(zusCalc.sickness);
        zusHealthSummary.innerText = formatCurrency(zusCalc.health);

        nettoSummaryYear.innerText = formatCurrency(invoice * 12);
        taxSummaryYear.innerText = formatCurrency(annualTaxAmount);
        zusSummaryYear.innerText = formatCurrency(zusCalc.total * 12);
        finalSummaryYear.innerText = formatCurrency(finalPay * 12);

        updateChartMonth(taxAmountMonthly, zusCalc.retirement, zusCalc.disability, zusCalc.sickness, zusCalc.health, finalPay);
    }
    
    function updateChartMonth(tax, ret, dis, sick, health, netto) {
        if (!taxChartMonth || taxChartMonth.closest('.d-none')) return;

        const ctx = taxChartMonth.getContext('2d');
        const labels = ['Podatek Dochodowy', 'Emerytalna', 'Rentowa', 'Chorobowa', 'Zdrowotna', 'Netto'];
        const dataValues = [tax, ret, dis, sick, health, netto];
        const colors = ['#ffcc99', '#f4b183', '#c6e0b4', '#9dc3e6', '#b4c6e7', '#66b3ff'];

        const filteredLabels = [];
        const filteredData = [];
        const filteredColors = [];

        dataValues.forEach((value, index) => {
            if (value > 0.01) {
                filteredLabels.push(labels[index]);
                filteredData.push(value);
                filteredColors.push(colors[index]);
            }
        });
        
        const total = filteredData.reduce((a, b) => a + b, 0);

        const data = {
            labels: filteredLabels,
            datasets: [{
                data: filteredData,
                backgroundColor: filteredColors,
                hoverOffset: 4
            }]
        };

        if (window.taxChartMonthInstance) {
            window.taxChartMonthInstance.destroy();
        }

        window.taxChartMonthInstance = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value.toFixed(2)} PLN (${percent}%)`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    function updateInvoiceHourlyVisibility() {
        // Show or hide the input groups based on the selected input type
        invoiceInputGroup.classList.toggle('d-none', !inputTypeInvoice.checked);
        hourlyInputGroup.classList.toggle('d-none', inputTypeInvoice.checked); // Show hourly input group when "Stawka godzinowa brutto" is selected
        updateSummary();
    }
    
    syncSliderInput(invoiceInput, invoiceManual, 15000, 5000, 30000, updateSummary);
    syncSliderInput(hourlyRateSlider, hourlyRateInput, 100, 31, 300, updateSummary); // min 31, max 300
    syncSliderInput(kupSlider, kupInput, 20, 0, 100, updateSummary);
    syncSliderInput(ppkEmployeeSlider, ppkEmployeeInput, 2, 2, 4, updateSummary);
    syncSliderInput(ppkEmployerSlider, ppkEmployerInput, 1.5, 1.5, 4, updateSummary);
    syncSliderInput(spouseIncomeSlider, spouseIncomeInput, 5000, 5000, 30000, updateSummary);
    syncSliderInput(hoursPerMonthInput, null, 160, 1, 720, updateSummary); // Sync hours per month, max 720

    inputTypeInvoice?.addEventListener('change', updateInvoiceHourlyVisibility);
    inputTypeHourly?.addEventListener('change', updateInvoiceHourlyVisibility);

    // Ensure the initial state is correct
    updateInvoiceHourlyVisibility();


    [inputTypeInvoice, inputTypeHourly, kupCheckbox, ppkCheckbox, under26Checkbox, studentCheckbox, remoteWorkCheckbox, hoursPerMonthInput]
        .forEach(el => el?.addEventListener('change', updateSummary));

    kupCheckbox?.addEventListener('change', function () {
        el('kupSliderGroup').classList.toggle('d-none', !this.checked);
    });
    
// B2B ZUS rates (simplified, poprawione)
    const ZUS_B2B = {
        pelny:  { retirement: 0.1952, disability: 0.08, sickness: 0.0245, accident: 0.0167, fp: 0.0245},
        maly:   { retirement: 0.1952, disability: 0.08, sickness: 0.0245, accident: 0.0167, fp: 0},
        ulga:   { retirement: 0, disability: 0, sickness: 0.0245, accident: 0, fp: 0}
    };

    function calculateZUSB2B(type, includeSickness = true) {
        const base = 5203.80;
        const smallBase = 1399.80;
        const zusRates = ZUS_B2B[type] || ZUS_B2B.pelny;

        let retirement = 0;
        let disability = 0;
        let sickness = 0;
        let accident = 0;
        let laborFund = 0;

        if (type === 'pelny') {
            retirement = base * zusRates.retirement;
            disability = base * zusRates.disability;
            sickness = includeSickness ? base * zusRates.sickness : 0;
            accident = base * zusRates.accident;
            laborFund = base * zusRates.fp;
        } else if (type === 'maly') {
            retirement = smallBase * zusRates.retirement;
            disability = smallBase * zusRates.disability;
            sickness = includeSickness ? smallBase * zusRates.sickness : 0;
            accident = smallBase * zusRates.accident;
            laborFund = smallBase * zusRates.fp;
        } else if (type === 'ulga') {
            retirement = 0;
            disability = 0;
            sickness = includeSickness ? base * zusRates.sickness : 0;
            accident = 0;
            laborFund = 0;
        }

        // Składka zdrowotna zależna od formy opodatkowania
        let health = 0;
        let healthBase = getInvoiceValueB2B() - retirement - sickness - disability - accident - laborFund;
        healthBase = Math.max(0, healthBase);

        // Pobierz formę opodatkowania (b2bTaxType.value)
        let b2bTaxTypeValue = "skala";
        if (typeof b2bTaxType !== "undefined" && b2bTaxType && b2bTaxType.value) {
            b2bTaxTypeValue = b2bTaxType.value;
        }

        if (b2bTaxTypeValue === 'liniowy19') {
            health = healthBase * 0.049;
        } else if (b2bTaxTypeValue === 'skala') {
            health = healthBase * 0.09;
        } else if (b2bTaxTypeValue === 'ryczalt8_5' || b2bTaxTypeValue === 'ryczalt12') {
            const annualIncome = getInvoiceValueB2B() * 12;
            if (annualIncome <= 60000) {
                health = 461.66;
            } else if (annualIncome > 60000 && annualIncome <= 300000) {
                health = 769.43;
            } else if (annualIncome > 300000) {
                health = 1384.97;
            }
        }

        return {
            retirement,
            disability,
            sickness,
            accident,
            laborFund,
            health,
            total: retirement + disability + sickness + accident + laborFund + health,
            totalWithoutHealth: retirement + disability + sickness + accident + laborFund
        };
    }

    function getInvoiceValueB2B() {
        if (inputTypeInvoiceB2B.checked) {
            return parseSafe(invoiceManualB2B.value, 15000, 5000, 30000);
        } else {
            return parseSafe(hourlyRateInputB2B.value, 100, 31, 300) * parseSafe(hoursPerMonthInputB2B.value, 160, 1, 720);
        }
    }

    // Dodaj referencję do wyboru VAT kosztów
    const b2bVatKoszty = el('b2bVatKoszty');

    // Funkcja automatycznie aktualizująca koszty po zmianie wartości lub stawki VAT
    function autoUpdateKoszty() {
        updateSummaryB2B();
    }

    if (b2bKosztyValue) {
        b2bKosztyValue.addEventListener('input', autoUpdateKoszty);
    }
    if (b2bVatKoszty) {
        b2bVatKoszty.addEventListener('change', autoUpdateKoszty);
    }

    function updateSummaryB2B() {
        const invoice = getInvoiceValueB2B();
        const zusType = b2bZusType.value;
        const includeSickness = b2bChorobowe.checked;
        const zusCalc = calculateZUSB2B(zusType, includeSickness);

        // Pobierz koszty i VAT od kosztów
        const koszty = b2bKoszty.checked ? parseSafe(b2bKosztyValue.value, 1000) : 0;
        const vatKosztyPercent = b2bVatKoszty ? parseFloat(b2bVatKoszty.value) : 0;
        const vatKoszty = koszty * (vatKosztyPercent / 100);
        const kosztyNetto = koszty; // Koszty netto (bez VAT)
        const kosztyBrutto = koszty + vatKoszty; // Koszty brutto (z VAT)

        // Dochód do opodatkowania: faktura - koszty netto - ZUS bez zdrowotnej
        const dochod = invoice - kosztyNetto - zusCalc.totalWithoutHealth;

        let incomeTax = 0;
        let b2bTaxTypeValue = b2bTaxType.value;

        // Składka zdrowotna do odliczenia od podatku (dla ryczałtu i liniowego)
        let healthDeduction = 0;

        if (b2bTaxTypeValue === 'liniowy19') {
            // Składka zdrowotna: minimum 314,96 zł
            zusCalc.health = Math.max(zusCalc.health, 314.96);
            incomeTax = dochod * 0.19;
            // Odliczenie 4.9% zapłaconej składki zdrowotnej od podatku, ale nie więcej niż 204,25 zł miesięcznie
            healthDeduction = Math.min(zusCalc.health * 0.049, 204.25);
            incomeTax = Math.max(0, incomeTax - healthDeduction);
        } else if (b2bTaxTypeValue === 'skala') {
            const taxThreshold = 120000;
            const taxFreeAmountDeduction = 3600;
            if (dochod * 12 <= taxThreshold) {
                incomeTax = (dochod * 0.12) - (taxFreeAmountDeduction / 12);
            } else {
                incomeTax = (10800 / 12) + ((dochod - (taxThreshold / 12)) * 0.32);
            }
            // Brak odliczenia składki zdrowotnej od podatku na skali
        } else if (b2bTaxTypeValue === 'ryczalt8_5') {
            incomeTax = (invoice) * 0.085;
            // Odliczenie 50% zapłaconej składki zdrowotnej od podatku
            healthDeduction = zusCalc.health * 0.06;
            incomeTax = Math.max(0, incomeTax - healthDeduction);
        } else if (b2bTaxTypeValue === 'ryczalt12') {
            incomeTax = (invoice) * 0.12;
            // Odliczenie 50% zapłaconej składki zdrowotnej od podatku
            healthDeduction = zusCalc.health * 0.06;
            incomeTax = Math.max(0, incomeTax - healthDeduction);
        }

        incomeTax = Math.max(0, incomeTax);

        // VAT logic
        const isVatowiec = el('b2bVatCheckbox').checked;
        const vatThreshold = 16667;
        const vatRate = 0.23;
        let vatSprzedaz = 0;
        let vatKosztyDoOdliczenia = 0;
        let vatToPay = 0;

        if (isVatowiec) {
            vatSprzedaz = Math.max(0, invoice) * vatRate;
            vatKosztyDoOdliczenia = vatKoszty;
            vatToPay = Math.max(0, vatSprzedaz - vatKosztyDoOdliczenia);
        } else {
            vatSprzedaz = 0;
            vatKosztyDoOdliczenia = 0;
            vatToPay = 0;
        }

        el('zusAccidentSummary').innerText = formatCurrency(zusCalc.accident);
        el('zusFundSummary').innerText = formatCurrency(zusCalc.laborFund);
        el('zusRetirementSummary').innerText = formatCurrency(zusCalc.retirement);
        el('zusDisabilitySummary').innerText = formatCurrency(zusCalc.disability);
        el('zusSicknessSummary').innerText = formatCurrency(zusCalc.sickness);
        el('zusHealthSummary').innerText = formatCurrency(zusCalc.health);

        el('costsSummaryYear').innerText = formatCurrency(kosztyBrutto * 12);
        el('vatSummaryYear').innerText = isVatowiec ? formatCurrency(vatToPay * 12) : "-";

        nettoSummary.innerText = formatCurrency(invoice);
        taxSummary.innerText = formatCurrency(incomeTax);
        zusSummary.innerText = formatCurrency(zusCalc.total);

        // Dochód netto = faktura - podatek - zus - koszty netto (koszty netto odliczane od dochodu, VAT od kosztów odliczany od VAT)
        // ODEJMUJEMY kosztyNetto od miesięcznego i rocznego dochodu netto
        const nettoMiesieczne = invoice - incomeTax - zusCalc.total - kosztyNetto;
        const nettoRoczne = (invoice * 12) - (incomeTax * 12) - (zusCalc.total * 12) - (kosztyNetto * 12);

        finalSummary.innerText = formatCurrency(nettoMiesieczne);
        nettoSummaryYear.innerText = formatCurrency(invoice * 12);
        taxSummaryYear.innerText = formatCurrency(incomeTax * 12);
        zusSummaryYear.innerText = formatCurrency(zusCalc.total * 12);
        finalSummaryYear.innerText = formatCurrency(nettoRoczne);

        updateChartMonthB2B(
            incomeTax,
            zusCalc.retirement,
            zusCalc.disability,
            zusCalc.sickness,
            zusCalc.health,
            nettoMiesieczne
        );
    }

    function updateChartMonthB2B(tax, ret, dis, sick, health, netto) {
        if (!taxChartMonthB2B || taxChartMonthB2B.closest('.d-none')) return;

        const ctx = taxChartMonthB2B.getContext('2d');
        const labels = ['Podatek Dochodowy', 'Emerytalna', 'Rentowa', 'Chorobowa', 'Zdrowotna', 'Netto'];
        const dataValues = [tax, ret, dis, sick, health, netto];
        const colors = ['#ffcc99', '#f4b183', '#c6e0b4', '#9dc3e6', '#b4c6e7', '#66b3ff'];

        const filteredLabels = [];
        const filteredData = [];
        const filteredColors = [];

        dataValues.forEach((value, index) => {
            if (value > 0.01) {
                filteredLabels.push(labels[index]);
                filteredData.push(value);
                filteredColors.push(colors[index]);
            }
        });

        const total = filteredData.reduce((a, b) => a + b, 0);

        const data = {
            labels: filteredLabels,
            datasets: [{
                data: filteredData,
                backgroundColor: filteredColors,
                hoverOffset: 4
            }]
        };

        if (window.taxChartMonthB2BInstance) {
            window.taxChartMonthB2BInstance.destroy();
        }

        window.taxChartMonthB2BInstance = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value.toFixed(2)} PLN (${percent}%)`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    // B2B input handlers
    syncSliderInput(invoiceInputB2B, invoiceManualB2B, 15000, 5000, 30000, updateSummaryB2B);
    syncSliderInput(hourlyRateSliderB2B, hourlyRateInputB2B, 100, 31, 300, updateSummaryB2B); // max 300
    syncSliderInput(hoursPerMonthInputB2B, null, 160, 1, 720, updateSummaryB2B); // max 720
    
    function updateInvoiceHourlyVisibilityB2B() {
        invoiceInputGroupB2B.classList.toggle('d-none', !inputTypeInvoiceB2B.checked);
        hourlyInputGroupB2B.classList.toggle('d-none', inputTypeInvoiceB2B.checked);
        updateSummaryB2B();
    }
    
    inputTypeInvoiceB2B?.addEventListener('change', updateInvoiceHourlyVisibilityB2B);
    inputTypeHourlyB2B?.addEventListener('change', updateInvoiceHourlyVisibilityB2B);
    
    [b2bTaxType, b2bZusType, b2bChorobowe, b2bKoszty, b2bKosztyValue, hoursPerMonthInputB2B, spouseIncomeInputB2B, b2bVatTypeCosts]
        .forEach(el => el && el.addEventListener('change', updateSummaryB2B));

    b2bKoszty?.addEventListener('change', function () {
        b2bKosztyValueGroup.classList.toggle('d-none', !this.checked);
        b2bVatTypeUnderKoszty.classList.toggle('d-none', !this.checked);
    });
    
    spouseB2B?.addEventListener('change', function () {
        spouseOptionsGroupB2B.classList.toggle('d-none', !this.checked);
    });

    b2bTaxType?.addEventListener('change', function() {
        const showSpouse = this.value === 'skala';
        el('spouseB2B').parentElement.classList.toggle('d-none', !showSpouse);
        if (!showSpouse) {
            el('spouseB2B').checked = false;
            spouseOptionsGroupB2B.classList.add('d-none');
        }
        updateSummaryB2B();
    });

    // PPK visibility handler
    function updatePPKVisibility() {
        // Show or hide the PPK groups based on the checkbox state
        const showPPK = ppkCheckbox.checked;
        el('ppkEmployeeGroup').classList.toggle('d-none', !showPPK);
        el('ppkEmployerGroup').classList.toggle('d-none', !showPPK);
        updateSummary();
    }

    // Sync sliders for PPK inputs
    syncSliderInput(ppkEmployeeSlider, ppkEmployeeInput, 2, 2, 4, updateSummary);
    syncSliderInput(ppkEmployerSlider, ppkEmployerInput, 1.5, 1.5, 4, updateSummary);

    // Add event listener for PPK checkbox
    ppkCheckbox?.addEventListener('change', updatePPKVisibility);

    // Ensure the initial state is correct
    updatePPKVisibility();

    // Initial state setup
    function updatePanels() {
        const mode = document.querySelector('input[name="modeType"]:checked')?.value;

        // Elementy zakładek
        const zusAccidentSummaryRow = el('zusAccidentSummaryRow');
        const zusFundSummaryRow = el('zusFundSummaryRow');

        if (mode === 'UOP') {
            // Ukryj zakładki w trybie UOP
            zusAccidentSummaryRow?.classList.add('d-none');
            zusFundSummaryRow?.classList.add('d-none');
            updateSummary();
        } else if (mode === 'B2B') {
            // Pokaż zakładki w trybie B2B
            zusAccidentSummaryRow?.classList.remove('d-none');
            zusFundSummaryRow?.classList.remove('d-none');
            updateSummaryB2B();
        }
    }

    // Initialize view
    updateInvoiceHourlyVisibility();
    updateInvoiceHourlyVisibilityB2B();
    el('kupSliderGroup').classList.add('d-none');
    el('ppkEmployeeGroup').classList.add('d-none');
    el('ppkEmployerGroup').classList.add('d-none');
    el('spouseOptionsGroup').classList.add('d-none');
    b2bKosztyValueGroup.classList.add('d-none');
    b2bVatTypeUnderKoszty.classList.add('d-none');
    spouseOptionsGroupB2B.classList.add('d-none');
    el('spouseB2B').parentElement.classList.toggle('d-none', b2bTaxType.value !== 'skala');

    updatePanels();
});