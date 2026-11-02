import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- PAGE 1: Overview and Chemical Foundations ---
  const page1 = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page1.getSize();

  // Header banner
  page1.drawText('EduCore AI - Student Study Series', {
    x: 50,
    y: height - 50,
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.5),
  });

  page1.drawText('Biology 101: Photosynthesis & Plant Energy', {
    x: 50,
    y: height - 85,
    size: 20,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  page1.drawText('Section 1: The Chemical Mechanism of Photosynthesis', {
    x: 50,
    y: height - 120,
    size: 14,
    font: timesRomanBold,
    color: rgb(0.15, 0.2, 0.25),
  });

  const p1Text = [
    'Photosynthesis is the fundamental biological process by which autotrophic organisms,',
    'predominantly green plants, algae, and cyanobacteria, harness radiant energy from sunlight',
    'to synthesize chemical energy in the form of glucose sugar.',
    '',
    'The balanced chemical equation governing oxygenic photosynthesis is:',
    '6CO2 + 6H2O + Radiant Light Energy -> C6H12O6 + 6O2',
    '',
    'Carbon dioxide is absorbed from the atmosphere via microscopic leaf pores known as stomata.',
    'Water is drawn up from soil by vascular root tissues and transported via xylem conduits.',
    'Chlorophyll pigments situated inside the thylakoid membranes of chloroplasts absorb photons,',
    'primarily in the blue and red wavelengths of the visible light spectrum, while reflecting green light.',
    '',
    'Core Functions of Photosynthesis:',
    '1. Primary Food Production: Converts inorganic carbon into bioavailable organic sugars.',
    '2. Atmospheric Oxygen Generation: Releases free diatomic oxygen via photolysis of water.',
    '3. Carbon Sequestration: Regulates global atmospheric carbon dioxide balances.',
  ];

  let yOffset = height - 150;
  for (const line of p1Text) {
    page1.drawText(line, {
      x: 50,
      y: yOffset,
      size: 11,
      font: timesRoman,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 16,
    });
    yOffset -= 20;
  }

  page1.drawText('Page 1 of 3 - EduCore Sample PDF Document', {
    x: 50,
    y: 35,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // --- PAGE 2: The Two Sequential Stages ---
  const page2 = pdfDoc.addPage([595, 842]);

  page2.drawText('Section 2: The Two Stages of Photosynthesis', {
    x: 50,
    y: height - 60,
    size: 16,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const p2Text = [
    'Stage 1: The Light-Dependent Reactions (Thylakoid Membrane)',
    'The light reactions convert solar energy directly into chemical carrier molecules.',
    'When light strikes Photosystem II, electrons inside chlorophyll P680 become energized.',
    'Water molecules are split through photolysis into hydrogen protons, electrons, and oxygen gas.',
    'The energized electrons pass through an electron transport chain, pumping protons across the',
    'membrane to establish a chemiosmotic gradient. As protons flow through ATP synthase,',
    'ATP is generated. Simultaneously, electrons are transferred to NADP+ to form high-energy NADPH.',
    '',
    'Stage 2: The Calvin Cycle / Light-Independent Reactions (Chloroplast Stroma)',
    'The Calvin cycle takes place in the fluid stroma surrounding the thylakoids and does not directly',
    'require light, though it relies on ATP and NADPH generated in the first stage.',
    'The cycle unfolds in three crucial phases:',
    'A. Carbon Fixation: The enzyme RuBisCO catalyzes the binding of carbon dioxide to RuBP.',
    'B. Reduction: ATP and NADPH reduce the 3-carbon intermediate molecules into G3P.',
    'C. Regeneration: A portion of G3P molecules is recycled using ATP to regenerate RuBP,',
    'allowing the continuous absorption of incoming carbon dioxide.',
    'Every two molecules of G3P that exit the cycle coalesce to synthesize one glucose molecule.',
  ];

  yOffset = height - 100;
  for (const line of p2Text) {
    page2.drawText(line, {
      x: 50,
      y: yOffset,
      size: 11,
      font: timesRoman,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 16,
    });
    yOffset -= 20;
  }

  page2.drawText('Page 2 of 3 - EduCore Sample PDF Document', {
    x: 50,
    y: 35,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // --- PAGE 3: Environmental Factors & Cellular Respiration Comparison ---
  const page3 = pdfDoc.addPage([595, 842]);

  page3.drawText('Section 3: Limiting Factors and Respiration Interdependence', {
    x: 50,
    y: height - 60,
    size: 16,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const p3Text = [
    'Rate-Limiting Environmental Factors:',
    '1. Light Intensity: Higher irradiance accelerates light reactions until electron carriers saturate.',
    '2. Carbon Dioxide Concentration: Enhances Calvin cycle fixation up to RuBisCO enzyme saturation.',
    '3. Temperature: Enzymatic activity peaks between 25C and 35C. Beyond 40C, RuBisCO denatures,',
    'causing photosynthetic efficiency to plummet.',
    '',
    'Photosynthesis vs. Cellular Respiration Comparison:',
    '- Photosynthesis is an anabolic, endergonic process occurring in chloroplasts that produces glucose.',
    '- Cellular respiration is a catabolic, exergonic process occurring in mitochondria that breaks down glucose',
    'into carbon dioxide, water, and usable ATP.',
    '- The waste products of photosynthesis (oxygen and carbohydrates) serve as direct reactants for respiration,',
    'forming an elegant biochemical cycle sustaining planetary life.',
    '',
    'Summary Review for Students:',
    'Remember that plants perform BOTH photosynthesis (in the presence of sunlight) and cellular respiration',
    'continuously (day and night) to generate ATP for cellular maintenance.',
  ];

  yOffset = height - 100;
  for (const line of p3Text) {
    page3.drawText(line, {
      x: 50,
      y: yOffset,
      size: 11,
      font: timesRoman,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 16,
    });
    yOffset -= 20;
  }

  page3.drawText('Page 3 of 3 - EduCore Sample PDF Document', {
    x: 50,
    y: 35,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.resolve(publicDir, 'sample_biology_study_guide.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Sample PDF created successfully at ${outputPath} (${pdfBytes.length} bytes)`);
}

generateSamplePdf().catch(console.error);
