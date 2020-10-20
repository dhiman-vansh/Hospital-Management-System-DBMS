var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var cors = require('cors');
var port = 3001

var con = mysql.createConnection({
  host: 'localhost',
  user: 'hathalye7',
  password: 'hrishikesh',
  database: 'HMS',
  multipleStatements: true
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

var email_in_use = "";
var password_in_use = "";

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/', indexRouter);
app.use('/users', usersRouter);

//Signup, Login, Password Reset Related Queries

app.get('/checkIfPatientExists', (req, res) => {
  let params = req.query;
  let email = params.email;
  con.query(`SELECT * 
             FROM Patient  
             WHERE email = "${email}"`, function (error, results, fields) {
    if (error) throw error;
    else {
      console.log(results);
      return res.json({
        data: results
      })
    };
  });
});

app.get('/makeAccount', (req, res) => {
  let query = req.query;
  let name = query.name + " " + query.lastname;
  let email = query.email;
  let password = query.password;
  let address = query.address;
  let gender = query.gender;

  let sql_statement = `INSERT INTO Patient (email, password, name, address, gender) 
                       VALUES ` + `("${email}", "${password}", "${name}", "${address}", "${gender}")`;
  console.log(sql_statement);

  con.query(sql_statement, function (error, results, fields) {
    if (error) throw error;
    else {
      email_in_use = email;
      password_in_use = password;
      return res.json({
        data: results
      })
    };
  });
});

app.get('/checkIfDocExists', (req, res) => {
  let params = req.query;
  let email = params.email;
  con.query(`SELECT * 
             FROM Doctor
             WHERE email = "${email}"`, function (error, results, fields) {
    if (error) throw error;
    else {
      console.log(results);
      return res.json({
        data: results
      })
    };
  });
});

app.get('/makeDocAccount', (req, res) => {
  let params = req.query;
  let name = params.name + " " + params.lastname;
  let email = params.email;
  let password = params.password;
  let gender = params.gender;
  let sql_statement = `INSERT INTO Doctor (email, gender, password, name) 
                       VALUES ` + `("${email}", "${gender}", "${password}", "${name}")`;
  console.log(sql_statement);
  con.query(sql_statement, function (error, results, fields) {
    if (error) throw error;
    else {
      email_in_use = email;
      password_in_use = password;
      return res.json({
        data: results
      })
    };
  });
});

app.get('/checklogin', (req, res) => {
  let params = req.query;
  let email = params.email;
  let password = params.password;
  let sql_statement = `SELECT * FROM Patient 
                       WHERE email="${email}" 
                       AND password="${password}"`;
  console.log(sql_statement);
  con.query(sql_statement, function (error, results, fields) {
    if (error) {
      console.log("error");
      return res.status(500).json({ failed: 'error ocurred' })
    }
    else {
      console.log(results);
      //return results;
      if (results.length === 0) {
      } else {
        var string = JSON.stringify(results);
        var json = JSON.parse(string);
        email_in_use = json[0].email;
        password_in_use = json[0].password;
        console.log(email_in_use);
        console.log(password_in_use);
      }
      return res.json({
        data: results
      })
    };
  });
});

app.get('/checkDoclogin', (req, res) => {
  let params = req.query;
  let email = params.email;
  let password = params.password;
  let sql_statement = `SELECT * 
                       FROM Doctor
                       WHERE email="${email}" AND password="${password}"`;
  console.log(sql_statement);
  con.query(sql_statement, function (error, results, fields) {
    if (error) {
      console.log("eror");
      return res.status(500).json({ failed: 'error ocurred' })
    }
    else {
      console.log(results);
      //return results;
      if (results.length === 0) {
      } else {
        var string = JSON.stringify(results);
        var json = JSON.parse(string);
        email_in_use = json[0].email;
        password_in_use = json[0].password;
        console.log(email_in_use);
        console.log(password_in_use);
      }
      return res.json({
        data: results
      })
    };
  });
});

app.post('/resetPasswordPatient', (req, res) => {
  let something = req.query;
  let email = something.email;
  let oldPassword = "" + something.oldPassword;
  let newPassword = "" + something.newPassword;

  let statement = `UPDATE Patient 
                   SET password = "${newPassword}" 
                   WHERE email = "${email}" 
                   AND password = "${oldPassword}";`;
  console.log(statement);
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      return res.json({
        data: results
      })
    };
  });
});


app.post('/resetPasswordDoctor', (req, res) => {
  let something = req.query;
  let email = something.email;
  let oldPassword = "" + something.oldPassword;
  let newPassword = "" + something.newPassword;

  let statement = `UPDATE Doctor
                   SET password = "${newPassword}" 
                   WHERE email = "${email}" 
                   AND password = "${oldPassword}";`;
  console.log(statement);
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      return res.json({
        data: results
      })
    };
  });
});

//Appointment Related

app.get('/checkIfApptExists', (req, res) => {
  let params = req.query;
  let email = params.email;
  let startTime = params.startTime;
  let date = params.date;

  let ndate = date.substring(0, 10);
  let sql_date = `STR_TO_DATE('${ndate}', '%Y-%m-%d')`;
  //sql to turn string to sql time obj
  let sql_start = `CONVERT('${startTime}', TIME)`;

  con.query(`SELECT * 
             FROM PatientsAttendAppointments, Appointment  
             WHERE patient = "${email}" AND
             appt = id AND
             date = ${sql_date} AND
             starttime = ${sql_start}`, function (error, results, fields) {
    if (error) throw error;
    else {
      console.log(results);
      return res.json({
        data: results
      })
    };
  });
});

app.get('/getDateTimeOfAppt', (req, res) => {
  let dead = req.query;
  let id = dead.id;
  let statement = `SELECT starttime as start, 
                          endtime as end, 
                          date as theDate 
                   FROM Appointment 
                   WHERE id = "${id}"`;
  console.log(statement);
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      console.log(results);
      console.log(JSON.stringify(results));
      return res.json({
        data: results
      })
    };
  });
});

//Patient Info Related

app.get('/names', (req, res) => {
  con.query('SELECT * FROM Patient', function (error, results, fields) {
    if (error) throw error;
    else {
      return res.json({
        data: results
      })
    };
  });
});

app.get('/OneHistory', (req, res) => {
  console.log("in one history");
  let params = req.query;
  let email = params.patientEmail;
  console.log(email);
    let statement = `SELECT gender,name,email,address,conditions,surgeries,medication
                    FROM PatientsFillHistory,Patient,MedicalHistory
                    WHERE PatientsFillHistory.history=id
                    AND patient=email AND email = ` + email;
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      return res.json({
        data: results
      })
    }
  })
});

//Returns id of patient history
app.get('/MedHistView', (req, res) => {
  let params = req.query;
  let patientName = "'%" + params.name + "%'";
  let secondParamTest = "" + params.variable;
  console.log(params);
    let statement = `SELECT name AS 'Name',
                    PatientsFillHistory.history AS 'ID',
                    email FROM Patient,PatientsFillHistory
                    WHERE Patient.email = PatientsFillHistory.patient`;
  if (patientName != "''")
    statement += " AND Patient.name LIKE " + patientName
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      return res.json({
        data: results
      })
    };
  });
});

//Works
app.get('/patientViewAppt', (req, res) => {
  let kill_me = req.query;
  let email = kill_me.email;
  let statement = `SELECT PatientsAttendAppointments.appt as ID, 
                          PatientsAttendAppointments.patient as user, 
                          PatientsAttendAppointments.concerns as theConcerns, 
                          PatientsAttendAppointments.symptoms as theSymptoms, 
                          Appointment.date as theDate,
                          Appointment.starttime as theStart,
                          Appointment.endtime as theEnd
                          FROM PatientsAttendAppointments, Appointment
                          WHERE PatientsAttendAppointments.patient = "${email}" AND
                          PatientsAttendAppointments.appt = Appointment.id`;
  console.log(statement);
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      console.log(results);
      console.log(JSON.stringify(results));
      return res.json({
        data: results
      })
    };
  });
});

app.get('/checkIfHistory', (req, res) => {
    let params = req.query;
    let email = params.email;
    let statement = "SELECT patient FROM PatientsFillHistory WHERE patient = " + email;
    con.query(statement, function (error, results, fields) {
        if (error) throw error;
        else {
            console.log(results);
            console.log(JSON.stringify(results));
            return res.json({
                data: results
            })
        };
    });
});

app.get('/addToPatientSeeAppt', (req, res) => {
  let params = req.query;
  let email = params.email;
  let appt_id = params.id;
  let concerns = params.concerns;
  let symptoms = params.symptoms;
  let sql_try = `INSERT INTO PatientsAttendAppointments (patient, appt, concerns, symptoms) 
                 VALUES ("${email}", ${appt_id}, "${concerns}", "${symptoms}")`;
  console.log(sql_try);
  con.query(sql_try, function (error, results, fields) {
    //console.log(query.sql);
    if (error) throw error;
    // else {
      
    // }
  });

});

app.get('/schedule', (req, res) => {
  let params = req.query;
  let time = params.time;
  let date = params.date;
  let id = params.id;
  let endtime = params.endTime;
  let concerns = params.concerns;
  let symptoms = params.symptoms;

  let ndate = date.substring(0, 10);

  let sql_date = `STR_TO_DATE('${ndate}', '%Y-%m-%d')`;
  //sql to turn string to sql time obj
  let sql_start = `CONVERT('${time}', TIME)`;

  //sql to turn string to sql time obj
  let sql_end = `CONVERT('${endtime}', TIME)`;
  let sql_try = `INSERT INTO Appointment (id, date, starttime, endtime, status) 
                 VALUES (${id}, ${sql_date}, ${sql_start}, ${sql_end}, "Not Done")`;
  console.log(sql_try);
  con.query(sql_try, function (error, results, fields) {
    //console.log(query.sql);
    if (error) throw error;
    // else {
      
    // }
  });
});

app.get('/genApptUID', (req, res) => {
  //query current max uid
  con.query('SELECT id FROM Appointment ORDER BY id DESC LIMIT 1;', function (error, results, fields) {
    //console.log(query.sql);
    if (error) throw error;
    else {
      console.log(results[0].id);
      let generated_id = results[0].id + 1;
      return res.json({ id: `${generated_id}` });
    };
  });
});

app.get('/userInSession', (req, res) => {
  return res.json({ email: `${email_in_use}` });
});

app.get('/endSession', (req, res) => {
  console.log("Ending session");
  email_in_use = "";
  password_in_use = "";
});

//!!!home.js
app.post('/scheduleAppt', (req, res) => { // probably delete later
  con.query('INSERT INTO users (first, last) VALUES ("ok", "ok")', function (error, results, fields) {
    //console.log(query.sql);
    if (error) throw error;
    // else {
    // };
  });
});

app.get('/doctorViewAppt', (req, res) => {
  let a = req.query;
  let email = a.email;
  let statement = `SELECT a.id,a.date, a.starttime, a.status, p.name, psa.concerns, psa.symptoms
  FROM Appointment a, PatientsAttendAppointments psa, Patient p
  WHERE a.id = psa.appt AND psa.patient = p.email`;
  console.log(statement);
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      return res.json({
        data: results
      })
    };
  });
});

app.get('/deleteAppt', (req, res) => {
  let a = req.query;
  let uid = a.uid;
  let statement = `DELETE FROM PatientsAttendAppointments p WHERE p.appt = ${uid}`;
  console.log(statement);
  con.query(statement, function (error, results, fields) {
    if (error) throw error;
    else {
      console.log('hi');
      let statement2 = `DELETE FROM ApptInRoom a WHERE a.appt = ${uid}`;
      console.log(statement2);
      con.query(statement, function (error, results, fields) {
      if (error) throw error;
          else {
      console.log('hi');
            let statement1 = `DELETE FROM Diagnose d WHERE d.appt = ${uid}`;
            console.log(statement1);
            con.query(statement, function (error, results, fields) {
              if (error) throw error;
              else {
                console.log('hi');
                let statement3 = `DELETE FROM ApptsToSchedules a WHERE a.appt = ${uid}`;
                console.log(statement3);
                con.query(statement, function (error, results, fields) {
                  if (error) throw error;
                  else {
                    console.log('hi');
                    return res.json({
                      data: results
                    })
                  };
          });

      };
  });
      
    };
  });
      
    };
  });

});

// If 404, forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`Listening on port ${port} `);
});

module.exports = app;