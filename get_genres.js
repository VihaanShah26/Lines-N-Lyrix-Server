//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require('./database.js')

exports.get_genres = async (req, res) => {

  console.log("call to /get_genres..");


  try {

    var rds_response = new Promise((resolve, reject) => {
      //outer try-catch block to make sure that promise is setup correctly
      try {
        console.log("/get_genres: calling RDS...");

        var sql = `
            SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(genre, '/', numbers.n), '/', -1)) AS genre
FROM 
  (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
   UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) numbers 
  INNER JOIN songs
  ON CHAR_LENGTH(genre) - CHAR_LENGTH(REPLACE(genre, '/', '')) >= numbers.n - 1
ORDER BY genre;
          `;
        dbConnection.query(sql, (err, results, _) => {
          //inner try block to see if any error during callback function execution
          try {
            //if err during query execution, reject the promise
            if (err) {
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
