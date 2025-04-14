import { AnyAction, Store } from "redux";
import { addNewAction, resetHistory } from "../actions/presentationActions";
import { PresentationActionType } from "../types/presentationType";

const createDispatch = (store: Store) => {
    return (action: AnyAction) => {
        // console.log(action)
        if (action.type == PresentationActionType.RESET_HISTORY) {
            store.dispatch(resetHistory())
        }

        if (action.type !== PresentationActionType.REDO
            && action.type !== PresentationActionType.UNDO
            && action.type !== PresentationActionType.OBJECTS_SET_SELECTION
            && action.type !== PresentationActionType.SLIDES_SET_SELECTION
        ) {
            store.dispatch(addNewAction(store.getState()))
        }

        store.dispatch(action)
    }
}

export default createDispatch
