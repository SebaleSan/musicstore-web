export interface Album {
  idAlbum: number;
  artist: string;
  title: string;
  year: number | null;
  genre: string;
  price: number;
  stock: number;
  coverArt: string | null;
}

export type AlbumRequest = Omit<Album, 'idAlbum'>;
