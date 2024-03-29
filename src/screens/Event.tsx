import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import FormEditActivity from '../components/forms/activities/FormEditActivity';
import FormAddActivity from '../components/forms/activities/FormAddActivity';
import FormActivities from '../components/forms/activities/FormActivities';
import UDialogUpdateEvent from '../components/dialog/events/UDialogUpdateEvent';
import UDialogActivity from '../components/dialog/activities/UDialogActivity';
import BoxCentralsStyled from "../components/styled/BoxCentralsStyled";
import BackgroundStyled from '../components/styled/BackgroundStyled';
import ButtonEditStyled from '../components/styled/ButtonEditStyled';
import Buttons from '../components/buttons/Buttons';
import Loading from '../components/Loading';

import fetchActivities from '../fetchers/activities/fetchActivities';
import createActivity from '../fetchers/activities/createActivity';
import deleteActivity from '../fetchers/activities/deleteActivity'
import addActivity from '../fetchers/events/addActivityToEvent';
import removeActivity from '../fetchers/events/removeActivityFromEvent';
import getState from "../utils/getState";
import formatDate from "../utils/formatDate";


import { Box, Grid } from '@mui/material';
import styled from "@emotion/styled";


export default function Event() {
    let params = useParams();

    const [event, setEvent] = useState<UfoEvent>();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [eventActivities, setEventActivities] = useState<UfoActivity[]>([]);
    const [allActivities, setAllActivities] = useState<UfoActivity[]>([]);
    const [activityToEdit, setActivityToEdit] = useState<UfoActivity>();

    // State to open or close the dialog to update event
    const [openDUE, setOpenDUE] = useState(false);
    const [openFormActivities, setOpenFormActivities] = useState(false);
    const [openFormAddActivity, setOpenFormAddActivity] = useState(false);
    const [openFormEditActivity, setOpenFormEditActivity] = useState(false);



    useEffect(() => {
        console.log(params);
        if (params.id) {
            fetchEvent(params.id)
            fetchActivities(params.id)
                .then((activities) => {
                    console.log(activities)
                    setEventActivities(activities);
                })


        }
    }, [params])

    const fetchEvent = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/events/${id}`);
            console.log(response)

            if (response.status !== 200) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const result = await response.json();
            console.log(result);
            setEvent(result)
            console.log(result.locked)
            if (!result.locked) {
                setEditMode(true);
            } else {
                setEditMode(false);
            }
        }
        catch (err) {
            console.error("Error while fetching event", err);
        }
    }



    const BoxStyled = styled(Box)`
        display: flex;
        flex-direction: column;
        color: white;
        border: solid #38444D;
        border-width: 2px;
        width: 95%;
        // margin: 0 10px;
    `


    /** 3 Functions to manage Dialog update Event display */
    const handleClickOpenDUE = () => {
        setOpenDUE(true);
        if (event)
            console.log(new Date(event.date_start).toISOString().split('T')[0])
    };
    const handleCloseDUE = () => {
        setOpenDUE(false);
    };

    /**
     * Function to handle the click on the button to update the event from child component,
     * call the function to update the event in the database and update the state
     * and close the dialog 
     * @param {event} event - The event's data to update
     */
    const handleValidDUE = (event: UfoEvent) => {
        console.log(event);
        setOpenDUE(false);
        updateEvent(event);
        setEvent(event);
    };

    const updateEvent = async (event: UfoEvent) => {
        console.log(event._id)
        const data = {
            id: event._id,
            name: event.name,
            location: event.location,
            date_start: event.date_start,
            date_end: event.date_end,
            description: event.description,
        }

        try {
            const response = await fetch(`http://localhost:3000/events/${event._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status !== 200) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const result = await response.json();
            console.log(result);

        } catch (err) {
            console.error("Error while updating event", err);
        }
    }

    const handleLockEvent = async () => {
        const data = {
            id: event?._id,
            date_end: event?.date_end,
        }

        try {
            const response = await fetch(`http://localhost:3000/events/lock/${event?._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status !== 200) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const result = await response.json();
            console.log(result);

        } catch (err) {
            console.error("Error while locking event", err);
        }
    }

    const lockEvent = () => {
        handleLockEvent()
            .then(() => {
                console.log("lock event then relaod event")
                if (params.id) {
                    fetchEvent(params.id);
                }
            })
    }

    function handleClickFormActivities() {
        setOpenFormActivities(true)
    }
    function handleCloseFormActivities() {
        setOpenFormActivities(false)
    }
    function handleValidFormActivities() {
        console.log("valid form activities")
        handleCloseFormActivities()
    }

    function handleClickFormAddActivity() {
        fetchActivities()
            .then((activities) => {
                console.log(activities)
                setAllActivities(activities);
            })
        setOpenFormAddActivity(true)
        setOpenFormActivities(false)
        console.log("form add act")
    }
    function handleCloseFormAddActivity() {
        setOpenFormAddActivity(false)
        setOpenFormActivities(true)
    }
    function handleValidFormAddActivity(eventId: number, activity: UfoActivity) {
        console.log("valid form add activity")
        console.log(activity)
        createActivity(eventId, activity)
            .then((act) => {
                console.log(act)
                addActivity(eventId, act)
                fetchActivities(params.id)
                    .then((activities) => {
                        console.log(activities)
                        setEventActivities(activities);
                    })
                    .then(() => { handleCloseFormAddActivity() })

            })
    }

    function handleClickFormEditActivity(activity: UfoActivity) {
        console.log("edit activity")
        console.log(activity)
        setActivityToEdit(activity)
        setOpenFormEditActivity(true)
    }

    function handleCloseFormEditActivity() {
        setOpenFormEditActivity(false)
    }

    function handleValidFormEditActivity(activity: UfoActivity) {
        console.log("valid form edit activity")
        console.log(activity)
        handleCloseFormEditActivity()

    }

    function handleClickRemoveActivity(eventId: number, activity: UfoActivity) {
        removeActivity(eventId, activity)
        deleteActivity(activity._id)
        .then(() => {
            fetchActivities(params.id)
                .then((activities) => {
                    console.log(activities)
                    setEventActivities(activities);
                })
        })
    }


    return (
        <>
            {event ? <UDialogUpdateEvent
                eventProp={event}
                open={openDUE}
                handleClose={handleCloseDUE}
                handleValid={handleValidDUE}
            /> : null}

            

            {event ? <FormActivities
                eventProp={event}
                open={openFormActivities}
                activities={eventActivities}
                handleClose={handleCloseFormActivities}
                handleValid={handleValidFormActivities}
                handleAddActivity={handleClickFormAddActivity}
                handleRemoveActivity={handleClickRemoveActivity}
                handleEditActivity={handleClickFormEditActivity}
            /> : null}

            {activityToEdit ? <UDialogActivity 
                open={openFormAddActivity}
                title="Dialog Activities"
                description='Description of the dialog'
                handleClose={handleCloseFormAddActivity}
                handleValid={handleValidFormActivities}
                activityProps={activityToEdit}
            />
            : null}

            {/* {event ? <FormAddActivity
                eventProp={event}
                open={openFormAddActivity}
                handleClose={handleCloseFormAddActivity}
                handleValid={handleValidFormAddActivity}
                activities={allActivities}
            /> : null} */}

            {/* {activityToEdit && event ? <FormEditActivity
                eventProp={event}
                open={openFormEditActivity}
                handleClose={handleCloseFormEditActivity}
                handleValid={handleValidFormEditActivity}
                activityToEdit={activityToEdit}
            /> : null} */}

            <BackgroundStyled>
                <BoxStyled>
                    <Grid container columns={24} direction="row" justifyContent="space-between" >
                        <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                            {event ?
                                <BoxCentralsStyled>
                                    <h2>
                                        {event.name}
                                        {editMode ? <ButtonEditStyled onClick={handleClickOpenDUE} scale={0.7} /> : <div />}
                                    </h2>

                                    <h3>{event.location}</h3>
                                    <h3>{formatDate(new Date(event.date_start), new Date(event.date_end))}</h3>
                                    <Box >
                                        <Grid container columns={12} direction="row" justifyContent="space-between" >
                                            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                                                <h3>{getState(event)}</h3>
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                                                {editMode ? <Buttons onClick={lockEvent}>Verrouiller évènement</Buttons> : <div />}
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </BoxCentralsStyled>

                                : <Loading />}
                        </Grid>


                        <Grid item xs={12} sm={12} md={12} lg={18} xl={12}>
                            <BoxCentralsStyled>
                                <h3>
                                    Activités
                                    {editMode ? <ButtonEditStyled onClick={handleClickFormActivities} scale={0.7} /> : <div />}
                                </h3>
                                <div>
                                    {eventActivities.map((activity) => activity.name).join(", ")}
                                </div>
                            </BoxCentralsStyled>

                        </Grid>

                        <Grid item xs={12} sm={12} md={12} lg={6} xl={12}>
                            <BoxCentralsStyled>
                                <h3>
                                    Equipes
                                    {editMode ? <ButtonEditStyled onClick={handleClickOpenDUE} scale={0.7} /> : <div />}
                                </h3>

                            </BoxCentralsStyled>

                        </Grid>

                        <Grid item xs={12} sm={12} md={12} lg={18} xl={12}>
                            <BoxCentralsStyled>
                                <h3>A venir/Score/planing</h3>
                            </BoxCentralsStyled>
                        </Grid>

                    </Grid>

                </BoxStyled>

            </BackgroundStyled>
        </>
    )
};