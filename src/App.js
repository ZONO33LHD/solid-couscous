import spotify from "./lib/spotify";
import { SongList } from "./components/SongList";
import { Player } from "./components/Player";
import { useEffect, useState, useRef } from "react";
import { SearchInput } from "./components/SearchInput";
import { Pagination } from "./components/Pagination";

const limit = 20;

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [popularSongs, setPopularSongs] = useState([]);
  const [isPlay, setIsPlay] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [searchSongs, setSearchSongs] = useState();
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const audioRef = useRef(null);
  const isSearchedResult = searchSongs != null;

  useEffect(() => {
    fetchPopularSongs();
  }, []);
  const fetchPopularSongs = async () => {
    setIsLoading(true);
    const result = await spotify.getPopularsSongs();
    const popularSongs = result.items.map((item) => {
      return item.track;
    });
    setPopularSongs(popularSongs);
    setIsLoading(false);
  };

  const handleSongSelected = async (song) => {
    setSelectedSong(song);
    if (song.preview_url) {
      audioRef.current.src = song.preview_url;
      playSong();
    } else {
      pauseSong();
    }
  };

  const playSong = () => {
    audioRef.current.play();
    setIsPlay(true);
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlay(false);
  };

  const toggleSong = () => {
    if (isPlay) {
      pauseSong();
    } else {
      playSong();
    }
  };

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleSearchSongs = async (page) => {
    setIsLoading(true);
    const offset = parseInt(page) ? (parseInt(page) - 1) * limit : 0;
    const result = await spotify.searchSongs(keyword, limit, offset);
    setHasNext(result.next != null);
    setHasPrev(result.previous != null);
    console.log(result);
    setSearchSongs(result.items);
    setIsLoading(false);
  };

  const moveToNext = async () => {
    const nextPage = page + 1;
    await handleSearchSongs(nextPage);
    setPage(nextPage);
  };

  const moveToPrev = async () => {
    const prevPage = page - 1;
    await handleSearchSongs(prevPage);
    setPage(prevPage);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-8 mb-20">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Music App</h1>
        </header>
        <SearchInput
          onInputChange={handleInputChange}
          onSearch={handleSearchSongs}
        />
        <section>
          <h2 className="text-2xl font-semibold mb-5">
            {isSearchedResult ? "SearchedResult" : "Popular Songs"}
          </h2>
          <SongList
            isLoading={isLoading}
            songs={isSearchedResult ? searchSongs : popularSongs}
            onSongSelected={handleSongSelected}
          />
          {isSearchedResult && (
            <Pagination
              onNext={hasNext ? moveToNext : null}
              onPrev={hasPrev ? moveToPrev : null}
            />
          )}
        </section>
      </main>
      {selectedSong != null && (
        <Player
          selectedSong={selectedSong}
          isPlay={isPlay}
          toggleSong={toggleSong}
        />
      )}
      <audio ref={audioRef} />
    </div>
  );
}
