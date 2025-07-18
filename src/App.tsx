import { useState, useRef } from "react";
import "./App.css";
import styles from "./App.module.css";
import YouTubePlayer from "./components/YouTubePlayer";
import { isValidYouTubeId } from "./utils/youtube";
import RemoveVideo from "./components/RemoveVideo";
import { FaPlay, FaPause } from "react-icons/fa";

function App() {
  // 入力中のURLを管理するstate
  const [inputValues, setInputValues] = useState<string[]>(["", ""]);
  // 表示する動画IDの「リスト」を管理するstate
  const [videoIds, setVideoIds] = useState<string[]>(["", ""]);
  // 全ての動画の再生状態を管理するstate
  const [playing, setPlaying] = useState(false);

  // 再生状態をtrueにする関数
  const handlePlayAll = () => setPlaying(true);
  // 再生状態をfalseにする関数
  const handlePauseAll = () => setPlaying(false);

  // シーク関連
  const [seek, setSeek] = useState(0);
  const playerRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // const handleSeekMouseUp = (event: React.SyntheticEvent<HTMLInputElement>) => {
  //   const inputTarget = event.target as HTMLInputElement;
  //   const seekTimeFraction = Number(inputTarget.value);
  //   console.log(seekTimeFraction);

  //   playerRefs.current.forEach((player) => {
  //     // playerが存在し、動画の長さ(duration)が取得できている場合のみ実行
  //     if (player && player.duration) {
  //       player.currentTime = seekTimeFraction * player.duration;
  //     }
  //   });
  // };

  const handleJumpSeek = () => {
    const seekTimeFraction = seek;

    playerRefs.current.forEach((player) => {
      // playerが存在し、動画の長さ(duration)が取得できている場合のみ実行
      if (player && player.duration) {
        player.currentTime = seekTimeFraction;
      }
    });
  };

  const updateVideoId = (index: number, newId: string) => {
    setVideoIds((currentIds) =>
      currentIds.map((id, i) => (i === index ? newId : id))
    );
  };

  // 動画を追加する関数
  const handleAddVideo = async (index: number, url: string) => {
    // URLが空なら何もしない
    if (!url) return;

    try {
      const urlObject = new URL(url);
      const id = urlObject.searchParams.get("v");

      if (id) {
        const isValid = await isValidYouTubeId(id);

        if (isValid) {
          updateVideoId(index, id);
          setInputValues((currentValues) =>
            currentValues.map((val, i) => (i === index ? "" : val))
          );
        } else {
          alert("存在しない、または非公開の動画IDです。");
        }
      } else {
        alert("有効なYouTubeのURLではありません。");
      }
    } catch (error) {
      console.error(error);
      alert("URLの形式が正しくありません。");
    }
  };

  // インデックスを指定して動画を削除する関数
  const handleRemoveVideo = (indexToRemove: number) => {
    setVideoIds((currentIds) =>
      currentIds.map((id, i) => (i === indexToRemove ? "" : id))
    );
    playerRefs.current.splice(indexToRemove, 1);
  };

  // 対応する入力欄の値を更新する関数
  const handleInputChange = (index: number, value: string) => {
    setInputValues((currentValues) =>
      currentValues.map((val, i) => (i === index ? value : val))
    );
  };

  return (
    <div className="App">
      <h1>YouTube Sync Viewer</h1>
      <div className={`${styles.inputContainer}`}>
        {playing && (
          <button className={styles.playAllButton} onClick={handlePauseAll}>
            <FaPause />
            すべて停止 / ALL PAUSE
          </button>
        )}
        {!playing && (
          <button className={styles.playAllButton} onClick={handlePlayAll}>
            <FaPlay />
            すべて再生 / ALL PLAY
          </button>
        )}
        <input
          name="seek"
          type="number"
          min={0}
          max={9999}
          onChange={(e) => setSeek(Number(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleJumpSeek()}
          className={styles.numberInput}
          defaultValue={0}
          placeholder="秒数を入力..."
        />
        <button onClick={handleJumpSeek} className={styles.jumpButton}>
          秒にジャンプ
        </button>
      </div>

      <ul className={styles.playerContainer}>
        {videoIds.map((id, index) => (
          <li
            key={`${id}_${index}`}
            className={
              id === "" || id === null ? styles.playerNoLoad : styles.playerItem
            }
          >
            {id === "" || id === null ? (
              <div className={styles.inputContainer}>
                <input
                  name="videoSrc"
                  className={styles.urlTextInput}
                  type="text"
                  placeholder="YouTube動画のURLを貼り付け"
                  value={inputValues[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleAddVideo(index, inputValues[index])
                  }
                />
                <button
                  onClick={() => handleAddVideo(index, inputValues[index])}
                  className={styles.addButton}
                >
                  追加
                </button>
              </div>
            ) : (
              <>
                <RemoveVideo index={index} onRemoveVideo={handleRemoveVideo} />
                <YouTubePlayer
                  id={id}
                  playing={playing}
                  ref={(el) => (playerRefs.current[index] = el)}
                />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
