import { PresentationRecordState, PresentationState } from "../../../../types";
import { PresentationActionType } from "../types/presentationType";
import { uid } from 'uid';
import { AnyAction } from 'redux';

const initialState: PresentationState = {
    title: '',
    slideList: [],
    history: {
        undoable: [],
        redoable: []
    },
    selection: {
        objects: [],
        slides: []
    }
}

const areStatesEqual = (state1: PresentationRecordState, state2: PresentationRecordState): boolean => {
    return (
        state1 === state2 &&
        JSON.stringify(state1.title) === JSON.stringify(state2.title) &&
        JSON.stringify(state1.slideList) === JSON.stringify(state2.slideList)
    )
}

const presentationReducer = (state = initialState, action: AnyAction): PresentationState => {
    const currentState: PresentationRecordState = {
        title: state.title,
        slideList: state.slideList,
        selection: state.selection,
    }

    switch (action.type) {
        case PresentationActionType.PRESENTATION_SET_TITLE:
            return {
                ...state,
                title: action.payload.newTitle
            }

        case PresentationActionType.PRESENTATION_ADD_SLIDE:
            return {
                ...state,
                slideList: [...state.slideList, action.payload.newSlide]
            }

        case PresentationActionType.PRESENTATION_REMOVE_SLIDE:
            return {
                ...state,
                slideList: state.slideList.filter(slide => !action.payload.slidesIdToRemove.includes(slide.id))
            }

        case PresentationActionType.PRESENTATION_UPDATE_SLIDELIST:
            return {
                ...state,
                slideList: action.payload.newSlideList
            }

        case PresentationActionType.SLIDE_CHANGE_BACKGROUND:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            background: action.payload.newBackground
                        }
                        : slide
                )
            }

        case PresentationActionType.SLIDE_CREATE_TEXTAREA:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: [
                                ...slide.objects,
                                {
                                    id: 'textarea_' + uid(10),
                                    type: 'text',
                                    position: action.payload.position,
                                    size: { h: 35, w: 80 },
                                    value: 'Текст',
                                    font: {
                                        fontFamily: 'Inter',
                                        weight: 800,
                                        size: 24,
                                        color: '#000000'
                                    }
                                }
                            ]
                        }
                        : slide
                )
            }

        case PresentationActionType.TEXTAREA_SET_FONTFAMILY:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                (object.id == action.payload.objectId && object.type == 'text')
                                    ? {
                                        ...object,
                                        font: {
                                            ...object.font,
                                            fontFamily: action.payload.newFontFamily
                                        }
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.TEXTAREA_SET_FONTSIZE:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                (object.id == action.payload.objectId && object.type == 'text')
                                    ? {
                                        ...object,
                                        font: {
                                            ...object.font,
                                            size: action.payload.newTextSize
                                        }
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.TEXTAREA_SET_FONTWEIGHT:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                (object.id == action.payload.objectId && object.type == 'text')
                                    ? {
                                        ...object,
                                        font: {
                                            ...object.font,
                                            weight: action.payload.newTextWeight
                                        }
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.TEXTAREA_SET_TEXTCOLOR:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                (object.id == action.payload.objectId && object.type == 'text')
                                    ? {
                                        ...object,
                                        font: {
                                            ...object.font,
                                            color: action.payload.newFontColor
                                        }
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.SLIDE_DELETE_OBJECTS:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.filter(object => !action.payload.objectsId.includes(object.id))
                        }
                        : slide
                )
            }

        case PresentationActionType.SLIDE_CREATE_IMAGE:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: [
                                ...slide.objects,
                                {
                                    id: 'image_' + uid(10),
                                    type: 'image',
                                    position: action.payload.position,
                                    size: { w: action.payload.dimensions.width, h: action.payload.dimensions.height },
                                    aspectRatio: action.payload.dimensions.aspectRatio,
                                    src: action.payload.src
                                }
                            ]
                        }
                        : slide
                )
            }

        case PresentationActionType.TEXTAREA_SET_VALUE:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                object.id == action.payload.textareaId && object.type == 'text'
                                    ? {
                                        ...object,
                                        value: action.payload.newValue
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.SLIDEOBJECT_SET_POSITION:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                object.id === action.payload.objectId
                                    ? {
                                        ...object,
                                        position: action.payload.newPosition
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.SLIDEOBJECT_SET_SIZE:
            return {
                ...state,
                slideList: state.slideList.map(slide =>
                    slide.id == action.payload.slideId
                        ? {
                            ...slide,
                            objects: slide.objects.map(object =>
                                object.id == action.payload.objectId
                                    ? {
                                        ...object,
                                        size: action.payload.newSize
                                    }
                                    : object
                            )
                        }
                        : slide
                )
            }

        case PresentationActionType.NEW_ACTION:
            if (!action.payload) return state
            if (areStatesEqual(currentState, action.payload)) return state
            return {
                ...state,
                history: {
                    undoable: [
                        currentState,
                        ...state.history.undoable.slice(0, 4)
                    ],
                    redoable: []
                }
            }


        case PresentationActionType.UNDO: {
            if (state.history.undoable.length === 0) return state
            const [previousState, ...remainingUndoable] = state.history.undoable
            return {
                ...state,
                title: previousState.title,
                slideList: previousState.slideList,
                selection: previousState.selection,
                history: {
                    undoable: remainingUndoable,
                    redoable: [
                        currentState,
                        ...state.history.redoable
                    ]
                }
            }
        }

        case PresentationActionType.REDO: {
            if (state.history.redoable.length === 0) return state
            const [nextState, ...remainingRedoable] = state.history.redoable;
            return {
                ...state,
                title: nextState.title,
                slideList: nextState.slideList,
                selection: nextState.selection,
                history: {
                    undoable: [
                        currentState,
                        ...state.history.undoable
                    ],
                    redoable: remainingRedoable
                }
            }
        }

        case PresentationActionType.SLIDES_SET_SELECTION:
            return {
                ...state,
                selection: {
                    ...state.selection,
                    slides: action.payload.newSelectedSlides
                }
            }

        case PresentationActionType.OBJECTS_SET_SELECTION:
            return {
                ...state,
                selection: {
                    ...state.selection,
                    objects: action.payload.newSelectedObjects
                }
            }

        case PresentationActionType.RESET_HISTORY:
            return {
                ...state,
                history: {
                    undoable: [],
                    redoable: []
                }
            }

        default:
            return state
    }
}

export default presentationReducer
