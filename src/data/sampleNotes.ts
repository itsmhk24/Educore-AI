export interface SampleNote {
  id: string;
  title: string;
  subject: string;
  fileName: string;
  pdfPath: string;
  pageCount: number;
}

export const SAMPLE_NOTES: SampleNote[] = [
  {
    id: 'photosynthesis',
    title: 'Photosynthesis & Cellular Energy',
    subject: 'Biology',
    fileName: 'biology_photosynthesis.pdf',
    pdfPath: '/samples/biology_photosynthesis.pdf',
    pageCount: 2,
  },
  {
    id: 'printing-press',
    title: 'The Printing Press Revolution',
    subject: 'World History',
    fileName: 'history_printing_press.pdf',
    pdfPath: '/samples/history_printing_press.pdf',
    pageCount: 2,
  },
  {
    id: 'newtons-laws',
    title: "Newton's Three Laws of Motion",
    subject: 'Physics',
    fileName: 'physics_newtons_laws.pdf',
    pdfPath: '/samples/physics_newtons_laws.pdf',
    pageCount: 2,
  }
];
