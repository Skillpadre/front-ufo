import React, {useState, useEffect, ReactElement} from "react"
import { Link } from "react-router-dom";

import formatDate from "../utils/formatDate";

import styled from "@emotion/styled";

import type { event } from "../types/event";

import ButtonMore from './ButtonMore'
import ButtonEdit from './ButtonEdit'
import BoxCentralsStyled from "./styled/BoxCentralsStyled";

interface Props {
    children?: ReactElement
    event: event
    isAdmin: boolean
}
export default function BoxCentralMain({ children, event,  isAdmin}: Props) {

    const [textStateEvent, setTextStateEvent] = useState<string>("En cours")

    useEffect(() => {
        if(event.state === "En création"){
            setTextStateEvent("En création")
        }
        else if(event.state === "En cours"){
            setTextStateEvent("En cours")
        }
        else if(event.state === "Terminé"){
            setTextStateEvent("Terminé")
        }
    }, [])

    const FloatingTextProcess = styled.p`
    float: right;
    margin-right: 10px;
    color: #1D9BF0;
    font-weight: bold;
    `

    const FloatingTextCreated = styled.p`
    float: right;
    margin-right: 10px;
    color: white;
    font-weight: bold;
    `

    const DivButton = styled(Link)`
    cursor: pointer;
    `

    return(
        <>
            <BoxCentralsStyled>
                <DivButton to={`event/${event._id}`}>
                    {event.state === "En création" ?<FloatingTextProcess>{textStateEvent}</FloatingTextProcess> : <FloatingTextCreated>{textStateEvent}</FloatingTextCreated>}
                    {event.state === "En création" ? <ButtonEdit scale={0.5} mr={0} /> : <ButtonMore />}
                </DivButton>
                <h2>
                    {event.name}
                </h2>
                <h3>
                    {event.location}
                </h3>
                <h3>
                    {formatDate(new Date(event.date_start), new Date(event.date_end))}
                </h3>
            </BoxCentralsStyled>
        </>
    )
}