//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require("./database.js");

exports.get_songs_special_editions = async (req, res) => {
  console.log("call to /get_songs_special_editions..");

  var edition = req.query.edition;

  try {
    var rds_response = new Promise((resolve, reject) => {
      //outer try-catch block to make sure that promise is setup correctly
      try {
        console.log("/get_songs_special_editions: calling RDS...");
        var sql = `
        SELECT song_ids FROM special_editions WHERE edition_name LIKE ?
          `;
        params = [edition];

        dbConnection.query(sql, params, (err, results, _) => {
          //inner try block to see if any error during callback function execution
          try {
            //if err during query execution, reject the promise
            if (err) {
              console.log("Error in getting response from RDS");
              console.log(err);
              reject(err);
              return;
            }

            console.log("/get_songs_special_editions query done once");
            resolve(results);
          } catch (code_err) {
            reject(code_err);
          }
        });
      } catch (code_err) {
        reject(code_err);
      }
    });

    //after query completed, need to check if promise has been resoloved or rejected due to some error
    rds_response
      .then((results) => {
        try {
          console.log(results);
        } catch (code_err) {
          res.status(400).json({
            message: code_err.message,
            data: [],
          });
        }
      })
      .catch((err) => {
        //
        // we get here if calls to RDS failed, or we
        // failed to process the results properly:
        //
        res.status(400).json({
          message: err.message,
          data: [],
        });
      });

    var idsString = results.ids;
    // var idsList = idsString.split(",").map(Number); // Convert to array and then to numbers

    console.log(idsString); 

    // getting the songs with the special editions song ids from the main table
    var rds_response2 = new Promise((resolve, reject) => {
      //outer try-catch block to make sure that promise is setup correctly
      try {
        console.log("/get_songs_special_editions: calling RDS...");
        var sql = `
        SELECT * FROM songs WHERE song_id IN ?;
          `;
        params = [idsString];

        dbConnection.query(sql, params, (err, results2, _) => {
          //inner try block to see if any error during callback function execution
          try {
            //if err during query execution, reject the promise
            if (err) {
              console.log("Error in getting response from RDS");
              console.log(err);
              reject(err);
              return;
            }

            console.log("/get_songs_special_editions query done once");
            resolve(results2);
          } catch (code_err) {
            reject(code_err);
          }
        });
      } catch (code_err) {
        reject(code_err);
      }
    });

    rds_response2.then(results2 => {
      try {
        console.log(results2)
        res.status(200).json({
          "message": "success",
          "data":results2
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

    
  } catch (err) {
    //try catch for the entire route
    res.status(400).json({
      message: err.message,
      data: [],
    });
  } //catch
}; //get
