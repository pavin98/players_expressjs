const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;
const intilizseDbtoServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started running");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

intilizseDbtoServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

///API1
app.get("/players/", async (Request, Response) => {
  const getplayerquery = `Select *
    From cricket_team
    Order By Player_id;`;
  let dbresponse = await db.all(getplayerquery);
  let result = [];
  for (let each of dbresponse) {
    let dbresponse1 = convertDbObjectToResponseObject(each);
    result.push(dbresponse1);
  }

  Response.send(result);
});

///API 2
app.post("/players/", async (Request, Response) => {
  const newplayer = Request.body;
  const { playerName, jerseyNumber, role } = newplayer;

  const newplayerquery = `Insert Into
    cricket_team (player_name,jersey_number,role)
    Values( '${playerName}',
        '${jerseyNumber}',
        '${role}');`;
  let dbresponse = await db.run(newplayerquery);
  Response.send("Player Added to Team");
});

///API 3
app.get("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;

  const getplayerquery = `Select *
    From cricket_team
    Where player_id = ${playerId};`;
  let dbresponse = await db.get(getplayerquery);
  let dbresponse1 = convertDbObjectToResponseObject(dbresponse);
  Response.send(dbresponse1);
});

///API 4
app.put("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;
  const newplayer = Request.body;
  const { playerName, jerseyNumber, role } = newplayer;
  console.log(newplayer.playerName);

  const Upadteplayerquery = `
    UPDATE 
      cricket_team
    SET 
     player_name = '${playerName}',
     jersey_number = '${jerseyNumber}',
     role = '${role}'
    Where player_id = ${playerId};`;
  let dbresponse = await db.run(Upadteplayerquery);
  Response.send("Player Details Updated");
});

///API 5
app.delete("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;
  const deleteplayerQuery = `
    DELETE FROM cricket_team
    Where player_id = ${playerId};`;
  let dbresponse = await db.run(deleteplayerQuery);
  Response.send("Player Removed");
});

module.exports = app;
