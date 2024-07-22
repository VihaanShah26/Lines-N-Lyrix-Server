//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require('./database.js')

exports.get_songs = async (req, res) => {

  console.log("call to /get_songs..");
  var { rounds, timePerRound, genre, decade } = req.query;
  console.log("Number of rounds: " + rounds);
  console.log("Genre: " + genre);
  console.log("Decade: " + decade);

  if (genre === 'Any') 
  {
    genre = "";
  }
  if (decade == "Any")
  {
    decade = "";
  }
  
  try {

    var rds_response = new Promise((resolve, reject) => {
      //outer try-catch block to make sure that promise is setup correctly
      try {
        console.log("/get_songs: calling RDS...");
        var sql = `
        SELECT * FROM songs WHERE genre LIKE ? AND decade LIKE ?
        ORDER BY RAND()
        LIMIT ?
          `;
        var params = ["%" + genre + "%", "%" + decade + "%", parseInt(rounds)];
        // if (genre != "Any")
        // {
        //   sql = `
        //   SELECT * FROM songs WHERE genre LIKE ?
        //   ORDER BY RAND()
        //   LIMIT ?
        //     `;
        //   params = ["%" + genre + "%", parseInt(rounds)];
        //   console.log("Specific genre: " + genre);
        // }
        
        dbConnection.query(sql, params, (err, results, _) => {
          //inner try block to see if any error during callback function execution
          try {
            //if err during query execution, reject the promise
            if (err) {
              console.log("Error in getting response from RDS");
              console.log(err)
              reject(err);
              return;
            }

            console.log("/get_songs query done once");
            resolve(results);
          }
          catch (code_err) {
            reject(code_err);
          }
        });
      }
      catch (code_err) {
        reject(code_err);
      }
    });

    //after query completed, need to check if promise has been resoloved or rejected due to some error
    rds_response.then(results => {
      try {
        console.log(results)
        res.status(200).json({
          "message": "success",
          "data":results
        });
      }
      catch (code_err) {
        res.status(400).json({
          "message": code_err.message,
          "data": []
        });
      }
    }).catch(err => {
      //
      // we get here if calls to RDS failed, or we
      // failed to process the results properly:
      //
      res.status(400).json({
        "message": err.message,
        "data": []
      });
    });    

  }//try catch for the entire route
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
