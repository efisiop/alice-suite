// src/data/fallbackBookData.ts
// Fallback book data for Alice in Wonderland

export const ALICE_BOOK_ID = 'alice-in-wonderland';

export interface BookSection {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

export interface BookData {
  id: string;
  title: string;
  author: string;
  sections: BookSection[];
}

export const fallbackBookData: BookData = {
  id: ALICE_BOOK_ID,
  title: "Alice's Adventures in Wonderland",
  author: "Lewis Carroll",
  sections: [
    {
      id: "chapter-1",
      title: "Chapter 1: Down the Rabbit-Hole",
      content: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'",
      pageNumber: 1
    },
    {
      id: "chapter-2",
      title: "Chapter 2: The Pool of Tears",
      content: "Curiouser and curiouser!' cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); 'now I'm opening out like the largest telescope that ever was! Good-bye, feet!' (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).",
      pageNumber: 2
    }
  ]
};

export const getBookSection = (sectionId: string): BookSection | undefined => {
  return fallbackBookData.sections.find(section => section.id === sectionId);
};

export const getAllBookSections = (): BookSection[] => {
  return fallbackBookData.sections;
};

export const getBookInfo = (): Omit<BookData, 'sections'> => {
  const { sections, ...bookInfo } = fallbackBookData;
  return bookInfo;
}; 