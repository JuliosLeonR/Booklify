export async function searchOpenLibraryBooks(query: string) {
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    if (!response.ok) {
      throw new Error("Failed to fetch books from Open Library API");
    }
    const data = await response.json();
    console.log(data)
    return data.docs || [];
  }