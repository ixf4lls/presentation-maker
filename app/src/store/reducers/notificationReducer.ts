import { Notification } from "../../../../types"
import { NotificationActionType } from "../types/notificationType"
import { uid } from 'uid'
import { AnyAction } from 'redux'

const initialState: Notification[] = []

const notificationReducer = (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case NotificationActionType.ADD_NOTIFICATION: {
            const notification: Notification = {
                id: 'notification_' + uid(10),
                message: action.payload.message,
                type: action.payload.type,
                info: action.payload.type == 'error' ? action.payload.info : null
            }
            return [notification, ...state]
        }

        case NotificationActionType.REMOVE_NOTIFICATION:
            return state.filter(notification => notification.id !== action.payload.id)

        default:
            return state
    }
}

export default notificationReducer
