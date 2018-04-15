import * as React from 'react'

export interface CalendarEvent {
    id: string
    type: string
    startTime: number,
    endTime: number,
    content: string
}

export interface RenderFormArgs {
    handleClose: () => void
    removeOne: (e: CalendarEvent) => void
    changeEvent: (e: CalendarEvent) => void
}

export interface DragCalendarProps {
    initialEventSource?: CalendarEvent[]
    onEventCreated?: (e: CalendarEvent) => void
    onEventUpdated?: (e: CalendarEvent) => void
    onEventRemoved?: (e: CalendarEvent) => void
    renderForm: (events: RenderFormArgs) => React.ReactElement<any>
    showDate: string | Date | number
    newOneContent?: any 
}

export class DragCalendar extends React.Component<DragCalendarProps, any>{}