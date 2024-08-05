import { useState, useEffect } from "react";

const Player = ({ name, symbol, isActive, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const handleClick = (event) => {
    setIsEditing((isEditing) => !isEditing);
    if (isEditing) {
      onNameChange(symbol, newName);
    }
  };

  const handleChange = (event) => {
    setNewName(event.target.value);
  };

  let playerName = <span className="player-name">{newName}</span>;
  let buttonName = "Edit";
  if (isEditing) {
    playerName = <input type="text" required value={newName} onChange={handleChange} />;
    buttonName = "Save";
  }

  return (
    <li className={isActive ? 'active' : undefined}>
      <span className="player">
        {playerName}
        <span className="player-symbol">{symbol}</span>
        <button onClick={handleClick}>{buttonName}</button>
      </span>
    </li>
  );
};

export default Player;
