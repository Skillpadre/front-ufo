import React, { useState, useEffect, useRef } from 'react';
import { event } from '../types/event';

import HomepageStyled from '../components/styled/HomepageStyled';
import DialogNewEvent from '../components/DialogNewEvent';
import PaperEvent from '../components/PaperEvent';
import SnackAlert from '../components/SnackAlert';
import Buttons from '../components/Buttons';
import BoxEvents from '../components/BoxEvents';
import BoxEventCentral from '../components/BoxEventCentral';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

interface Props {
    isAdmin: boolean;
}


function Homepage({ isAdmin }: Props) {

    const eventSelected = useRef<event | null>(null);

    // State to store the events fetched from the API
    const [events, setEvents] = useState<event[]>([]);
    const [eventsCreated, setEventsCreated] = useState<event[]>([]);
    const [eventsInProgress, setEventsInProgress] = useState<event[]>([]);
    const [eventCentral, setEventCentral] = useState<event | null>(null);

    // State to open or close the dialog to create new event
    const [openDNE, setOpenDNE] = useState(false);

    // State to open or close the snackbar
    const [openSnack, setOpenSnack] = useState(false);
    const [errorSnackMsg, setErrorSnackMsg] = useState('Error');
    const [alertType, setAlertType] = useState('error');


    // Get all events when the component is mounted
    useEffect(() => {

        fetchAllEvents();

    }, []);

    /**Fetch all events
     * @returns {void}
     */
    const fetchAllEvents = async () => {
        setEvents([]);
        setEventsCreated([]);
        setEventsInProgress([]);
        try {
            const response = await fetch(`http://localhost:3000/events/`);
            console.log(response)

            if (response.status !== 200) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const result = await response.json();
            console.log(result);
            setEvents(result)

            result.forEach((event: event) => {
                if(event.state === "En création"){
                    setEventsInProgress((eventsInProgress) => [...eventsInProgress, event]);
                } else {
                    setEventsCreated(eventsCreated => [...eventsCreated, event])
                } 
            });
        }
        catch (err) {
            console.error("Error while fetching all events", err);
        }
    }

    /** Function to create a new event in the database
     * @param {event} event
     * @returns {void}
     */
    const createEvent = async (event: event) => {
        // Format the date to be compatible with the database
        const data = {
            name: event.name,
            location: event.location,
            start_date: new Date(event.date_start),
            end_date: new Date(event.date_end),
            state: "En création"
        }

        try {

            const response = await fetch('http://localhost:3000/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            console.log(response)

            if (response.status !== 200) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const result = await response.json()
            console.log(result)
            handleOpenSnack(`L'évènement "${data.name}" a bien été créé.`, 'success');

        }
        catch (err) {
            console.error("Error while creating a new event", err);
            handleOpenSnack(`L'évènement "${data.name}" n'a pas pu être créé.`, 'error');
        }
        fetchAllEvents();
    }


    /** Function to delete an event
     * @param {number | undefined} id - The id of the event to delete
     * @returns {void}
     * 
     */
    const deleteEvent = async (id: number | undefined, name: string) => {
        console.log('deleting event ... event id :', id)

        try {
            const response = await fetch(`http://localhost:3000/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.status !== 200) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const result = await response.json()
            console.log(result)

            // Update the events list to remove the deleted event
            fetchAllEvents();
            handleOpenSnack(`L'évènement "${name}" a bien été supprimé.`, 'success');


        }
        catch (err) {
            console.error("Error while deleting an event", err);
            handleOpenSnack(`Une erreur s'est produite, l'évènement "${name}" n'a pas pu etre supprimé.`, 'error');

        }
    }

    /** Function called when the user click on the button to delete an event
     * Delete the event in the database and update the state 
     * @param {number | undefined} id - The id of the event to delete
     * @returns {void}
     * 
    */

    const handleClickEvent = (event: event) => {
        console.log('click event')
        console.log(event)
        setEventCentral(event);
        eventSelected.current = event;
        console.log(eventSelected.current)
    }

    const handleDeleteEvent = (id: number, name: string) => {
        deleteEvent(id, name)
    }


    /** 3 Functions to manage Dialog New Event display */
    const handleClickOpenDNE = () => {
        setOpenDNE(true);
    };
    const handleCloseDNE = () => {
        setOpenDNE(false);
    };

    /**
     * Function to handle the click on the button to create a new event from child component,
     * call the function to create the event in the database and update the state
     * and close the dialog 
     * @param {event} event - The event's data to create
     */
    const handleValidDNE = (event: event) => {
        createEvent(event);
        setOpenDNE(false);
    };

    const handleOpenSnack = (msg: string, type: string) => {
        setErrorSnackMsg(msg);
        setAlertType(type)
        setOpenSnack(true);

        console.log('open snack')
    }

    const handleCloseSnack = () => {
        setOpenSnack(false);
        console.log('close snack')
    }
    return (
        <>
            <SnackAlert open={openSnack} handleClose={handleCloseSnack} type={alertType} errorMessage={errorSnackMsg} />

            <DialogNewEvent open={openDNE} handleClose={handleCloseDNE} handleValid={handleValidDNE} />

            <HomepageStyled>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        // width: '80%',
                        // ml: '10%'
                    }}
                >
                    {/* <h1 className="title">UFOLEP</h1>
                        <h2 className="test">TEST GRADIENT LINEAR</h2> */}
                    <img src="ufolep.png" className="logo-ufolep" alt="Ufolep" />
                </Box>
                <Grid container direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Grid item sx={{mr: 2}}>
                        <Buttons onClick={handleClickOpenDNE}>
                            Create new event
                        </Buttons>
                    </Grid>
                </Grid>
                {/* <Button variant="contained" onClick={() => { handleOpenSnack("This is a success message", 'success') }}>
                        Open snackbar
                    </Button>
                    <button >Get all events</button> */}
                <Grid container columns={24} direction="row" justifyContent="space-between"  sx={{ mt: 2 }}>
                    <Grid item xs={24} sm={12} md={8} lg={7} xl={5} >

                        <BoxEvents
                            title="Evènements passés"
                            events={eventsCreated}
                            isAdmin={isAdmin}
                            handleDeleteEvent={handleClickEvent}
                        />

                        
                    </Grid>

                    <Grid item xs={0} sm={12} md={8} lg={10} xl={14} sx={{background: '#273340'}}>
                    {eventCentral ? 
                        <BoxEventCentral
                            event={eventCentral}
                            isAdmin={isAdmin}
                        />
                        : <p>tg</p>}
                    </Grid>

                       

                        
                    {/* <Grid item style={{ display: 'flex', flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>


                        <BoxEvents
                            title="Infos"
                            events={events}
                            isAdmin={isAdmin}
                            handleDeleteEvent={handleDeleteEvent}
                        />

                    </Grid> */}
                    <Grid item xs={24} sm={12} md={8} lg={7} xl={5} >

                        <BoxEvents
                            title="Evènements en création"
                            events={eventsInProgress}
                            isAdmin={isAdmin}
                            handleDeleteEvent={handleClickEvent}
                        />
                    </Grid>

                </Grid>

            </HomepageStyled>
        </>
    );
}

export default Homepage;