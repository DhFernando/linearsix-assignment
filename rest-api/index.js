require('dotenv').config();
const express = require('express')
const { google } = require('googleapis')
const moment = require('moment');

const app = express();

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.SECRET_ID, process.env.REDIRECT)

app.get('/', function (req, res) {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
    })
    res.redirect(url)
})

app.get('/redirect', function (req, res) {
    const code = req.query.code
    oauth2Client.getToken(code, (err, tokens) => {
        if (err){
            console.error('unable to get tokens' ,err)
            res.send('error')
            return
        }
        oauth2Client.setCredentials(tokens)
        res.send('success')
    })
})

app.get('/calendar', function (req, res) {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.calendarList.list({}, (err, response) => {
        if (err){
            console.error('unable to list calendars',err)
            res.end('error')
            return;
        }
        const calenders = response.data.items;
        res.json(calenders);
    })
})

app.get('/events', (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarId = req.query.calendar??'primary';
    calendar.events.list({
        calendarId,
        timeMin: (new Date()).toISOString(), 
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, response) => {
        if(err) {
            console.error(err, 'unable to list events')
            res.send("error")
            return;   
        }
        const events = response.data.items;
        res.json(events);
    });
})

app.get('/arrayofbusyintervals', (req, res) => {
    const startTime = moment('2024-05-01T00:00:00Z');
    const endTime = moment('2024-05-07T00:00:00Z');

    console.log('====================================');
    console.log(startTime, endTime);
    console.log('====================================');
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarId = req.query.calendar??'primary';
    calendar.events.list({
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, response) => {
        if(err) {
            console.error(err, 'unable to list events')
            res.send("error")
            return;   
        }
        const busyIntervals  = response.data.items.map(event => {
            const start = moment(event.start.dateTime || event.start.date);
            const end = moment(event.end.dateTime || event.end.date);
            return { start, end };
        });

        // res.json(busyIntervals);

        const freeIntervals = [];
        let lastEnd = moment(startTime);
        for (const interval of busyIntervals) {
            if (interval.start.isAfter(lastEnd)) {
                freeIntervals.push({ start: lastEnd, end: interval.start });
            }
            if (interval.end.isAfter(lastEnd)) {
                lastEnd = interval.end;
            }
        }

        if (lastEnd.isBefore(endTime)) {
            freeIntervals.push({ start: lastEnd, end: endTime });
        }

        res.json(freeIntervals);

    });
})

app.listen(3000, ()=>console.log('listening on port at 3000'));

// http://localhost:3000/events?calendar=hdilshan.fernando11@gmail.com
// https://developers.google.com/calendar/api/v3/reference/events/list