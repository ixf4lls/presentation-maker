import styles from '../assets/styles/Properties.module.css'
import { Background, Gradient } from '../../../types'
import { useEffect, useRef, useState } from 'react'

import { RootState } from '../store/reducers/rootReducer'
import { useSelector } from 'react-redux'
import createDispatch from '../store/utils/createDispatch'
import { changeBackground, setFontFamily, setFontWeight, setFontSize, setFontColor } from '../store/actions/presentationActions'
import store from '../store'
import { UnsplashUploadMenu } from './UnsplashUploadMenu'

function SlideSelected() {
    const slideList = useSelector((state: RootState) => state.presentation.slideList)
    const selectedSlides = useSelector((state: RootState) => state.presentation.selection.slides)
    const dispatch = createDispatch(store)
    const currentSlide = slideList.find(slide => slide.id == selectedSlides[selectedSlides.length - 1])
    const currentSlideId = currentSlide ? currentSlide.id : '0'
    const currentSlideIndex = currentSlide ? slideList.indexOf(currentSlide) : 1

    const [colorValue, setColorValue] = useState('')
    const [gradientColors, setGradientColors] = useState<string[]>([])

    const [directionValue, setDirectionValue] = useState(0)
    const [positionValues, setPositionValues] = useState<number[]>([])

    const [bgType, setBgType] = useState<'color' | 'image'>('color')
    const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false)
    const [unsplashUploadToBgActive, setUnsplashUploadToBgActive] = useState<boolean>(false)

    const [fillType, setFillType] = useState<'solid' | 'gradient'>('solid')

    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (currentSlide) {
            switch (currentSlide.background.type) {
                case 'color':
                    setBgType('color')
                    setFillType('solid')
                    setIsImageUploaded(false)
                    setColorValue(String(currentSlide.background.value).slice(1).toUpperCase())
                    setGradientColors([])
                    setPositionValues([])
                    setDirectionValue(0)
                    break

                case 'image':
                    setBgType('image')
                    setIsImageUploaded(true)
                    setColorValue('')
                    setGradientColors([])
                    setPositionValues([])
                    setDirectionValue(0)
                    break

                case 'gradient':
                    setBgType('color')
                    setFillType('gradient')
                    setIsImageUploaded(false)
                    setDirectionValue(currentSlide.background.direction)
                    setGradientColors(currentSlide.background.colors.map(color => color.color.replace('#', '')))
                    setPositionValues(currentSlide.background.colors.map(color => color.position))
                    setColorValue('')
                    break

                default:
                    return
            }
        }
    }, [currentSlide])

    if (!currentSlide) return null

    function isValidColor(value: string) {
        const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return pattern.test(value)
    }

    const onColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        setColorValue(newValue.slice(1).toUpperCase())
    }

    const onColorBlur = () => {
        const newBackground: Background = { type: 'color', value: `#${colorValue}` }
        dispatch(changeBackground(currentSlideId, newBackground))
    }

    const onColorTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value.toUpperCase()
        setColorValue(newValue)
    }

    const onColorTextBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.toUpperCase()
        const newValue = '#' + inputValue
        if (isValidColor(newValue)) {
            const newBackground: Background = { type: 'color', value: newValue }
            dispatch(changeBackground(currentSlideId, newBackground))
        }
    }

    const onDirectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace('°', '')
        if (!isNaN(Number(value))) {
            const newDirection = Math.max(0, Math.min(Number(value), 360))
            setDirectionValue(newDirection)
        }
    }

    const onDirectionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const newDirection = Number(event.target.value.replace('°', ''))
        const newBackground: Background = {
            type: 'gradient',
            direction: newDirection,
            colors: currentSlide.background.type == 'gradient' ? currentSlide.background.colors : []
        }
        dispatch(changeBackground(currentSlideId, newBackground))
    }

    const renderSolidColorField = () => {
        return (
            <>
                <div className={styles.backgroudSettings__colorField}>
                    <div className={styles.color__container}>
                        <input
                            type='color'
                            className={styles.currentColor}
                            onChange={onColorChange}
                            onBlur={onColorBlur}
                            value={`#${colorValue}`}
                        />
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.currentColorText}
                        value={colorValue}
                        placeholder='FFFFFF'
                        onBlur={onColorTextBlur}
                        onChange={onColorTextChange}
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = event.target.value.toUpperCase()
                            setColorValue(newValue)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur()
                            }
                        }}
                        maxLength={6}
                    />
                </div>
            </>
        )
    }

    const renderGradientColorField = () => {
        const handleChangeColor = (event: React.ChangeEvent<HTMLInputElement>, i: number) => {
            const newColor = event.currentTarget.value.replace('#', '').toUpperCase()
            const newGradientColors = gradientColors.map((color, index) =>
                index === i ? newColor : color
            )
            setGradientColors(newGradientColors)
        }

        const handleBlurColor = (event: React.ChangeEvent<HTMLInputElement>, i: number) => {
            if (currentSlide.background.type !== 'gradient') return
            const newColor = event.currentTarget.value.toUpperCase()
            if (isValidColor(newColor) || isValidColor('#' + newColor)) {
                const newBackground: Gradient = {
                    type: 'gradient',
                    direction: currentSlide.background.direction,
                    colors: currentSlide.background.colors.map((color, index) =>
                        index === i
                            ? { ...color, color: newColor }
                            : color
                    )
                }
                dispatch(changeBackground(currentSlideId, newBackground))
            }
        }

        const handleChangePosition = (event: React.ChangeEvent<HTMLInputElement>, i: number) => {
            const value = event.currentTarget.value.replace('%', '')
            if (!isNaN(Number(value))) {
                const newPosition = Math.max(0, Math.min(Number(value), 100))
                const newPositionValues = positionValues.map((position, index) =>
                    index === i ? newPosition : position
                )
                setPositionValues(newPositionValues)
            }
        }

        const handleBlurPosition = (event: React.ChangeEvent<HTMLInputElement>, i: number) => {
            if (currentSlide.background.type !== 'gradient') return
            const value = event.currentTarget.value.replace('%', '')
            if (!isNaN(Number(value))) {
                const newPosition = Math.max(0, Math.min(Number(value), 100))
                const newBackground: Gradient = {
                    type: 'gradient',
                    direction: currentSlide.background.direction,
                    colors: currentSlide.background.colors.map((color, index) =>
                        index === i
                            ? { ...color, position: newPosition }
                            : color
                    )
                }
                dispatch(changeBackground(currentSlideId, newBackground))
            }
        }

        const handleRemoveColor = (i: number) => {
            if (currentSlide.background.type !== 'gradient') return
            const newGradientColors = [...currentSlide.background.colors]
            newGradientColors.splice(i, 1)
            const newBackground: Gradient = {
                type: 'gradient',
                direction: currentSlide.background.direction,
                colors: newGradientColors
            }

            dispatch(changeBackground(currentSlideId, newBackground))
        }

        const handleAddColor = () => {
            if (currentSlide.background.type == 'gradient') {
                const blankColor = {
                    color: '#FFFFFF',
                    position: 100
                }
                const newGradientColors = [blankColor, ...currentSlide.background.colors]
                const newBackground: Gradient = {
                    type: 'gradient',
                    direction: currentSlide.background.direction,
                    colors: newGradientColors
                }
                dispatch(changeBackground(currentSlideId, newBackground))
            } else {
                const blankColor = {
                    color: '#FFFFFF',
                    position: 100
                }
                const newBackground: Gradient = {
                    type: 'gradient',
                    direction: 0,
                    colors: [blankColor]
                }
                dispatch(changeBackground(currentSlideId, newBackground))
            }
        }

        const renderGradientColors = currentSlide.background.type == 'gradient'
            ? currentSlide.background.colors.sort((a, b) => {
                return a.position - b.position
            }).map((_, i) => {
                return (
                    <div
                        className={styles.color__gradient}
                        key={`gradient_${i}`}
                    >
                        <div className={styles.gradientColor}>
                            <div className={styles.gradientColor__input}>
                                <input
                                    type="color"
                                    className={styles.gradientColor__color}
                                    value={`#${gradientColors[i] || '#FFFFFF'}`}
                                    onChange={event => handleChangeColor(event, i)}
                                    onBlur={event => handleBlurColor(event, i)}
                                />
                            </div>
                            <input
                                type="text"
                                className={styles.gradientColor__text}
                                value={`${gradientColors[i] || '#FFFFFF'}`}
                                placeholder='FFFFFF'
                                onChange={event => handleChangeColor(event, i)}
                                onBlur={event => handleBlurColor(event, i)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur()
                                    }
                                }}
                                maxLength={6}
                            />
                            <div className={styles.gradientColor__divider}></div>
                            <input
                                type='text'
                                className={styles.gradientColor__position}
                                value={`${positionValues[i]}%`}
                                onChange={event => handleChangePosition(event, i)}
                                onBlur={event => handleBlurPosition(event, i)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur()
                                    }
                                }}
                            />
                        </div>
                        <div
                            className={styles.gradient__remove}
                            onClick={() => handleRemoveColor(i)}
                        >
                            <img
                                src="/src/assets/images/remove_gradient.svg"
                                alt=""
                            />
                        </div>
                    </div>
                )
            })
            : ''

        return (
            <>
                <div className={styles.gradient__direction}>
                    <div className={styles.direction__title}>Угол поворота</div>
                    <input
                        type="text"
                        className={styles.direction__input}
                        value={`${directionValue}\u00B0`}
                        onChange={onDirectionChange}
                        onBlur={onDirectionBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur()
                            }
                        }}
                    />
                </div>

                <div className={styles.gradient__colors}>
                    <div className={styles.colors__title}>Цвета</div>
                    <div className={styles.colors__items}>
                        {renderGradientColors}
                    </div>

                    <div
                        className={styles.colors__addItem}
                        onClick={() => handleAddColor()}
                    >
                        <div className={styles.addItem__title}>Добавить цвет</div>
                        <div className={styles.addItem__image}>
                            <img src="/src/assets/images/add_gradient.svg" alt="" />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const renderColorField = () => {
        return (
            <>
                <div className={styles.fillType}>
                    <div className={styles.fillType__title}>Тип заливки</div>
                    <div className={styles.fillType__selection}>
                        <div
                            className={`${styles.fillType__item} ${fillType == 'solid' ? '' : styles.fillType__item_inactive}`}
                            onClick={() => {
                                if (fillType !== 'solid') {
                                    setFillType('solid')
                                }
                            }}
                        >
                            <p>Сплошная</p>
                        </div>

                        <div
                            className={`${styles.fillType__item} ${fillType == 'gradient' ? '' : styles.fillType__item_inactive}`}
                            onClick={() => {
                                if (fillType !== 'gradient') {
                                    setFillType('gradient')
                                }
                            }}
                        >
                            <p >Градиент</p>
                        </div>

                        <div
                            className={styles.fillType__active}
                            style={{
                                right: fillType == 'solid' ? '107px' : '13px'
                            }}
                        ></div>
                    </div>
                </div>
                {
                    fillType == 'solid'
                        ? renderSolidColorField()
                        : renderGradientColorField()
                }
            </>
        )
    }

    const handleFileInputClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const src = reader.result as string
                dispatch(changeBackground(currentSlideId, { type: 'image', src: src }))
            }
            reader.readAsDataURL(file)
        }

    }

    const handleBgImageDelete = () => {
        dispatch(changeBackground(currentSlideId, { type: 'color', value: '#FFFFFF' }))
        setIsImageUploaded(false)
    }

    const renderImageField = () => {
        const renderUploadButton = () => {
            return (
                <>
                    <div className={styles.imageField__uploadButton} onClick={handleFileInputClick}>
                        <div className={styles.uploadButton__text}>Выбрать файл</div>
                        <img className={styles.uploadButton__image} src='/src/assets/images/folder.svg' />
                    </div>

                    <input
                        type="file"
                        accept='.jpg, .png, .svg, .jpeg'
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <div
                        className={`${styles.additionalMenu} ${styles.unsplashUpload}`}
                        onClick={() => {
                            setUnsplashUploadToBgActive(true)
                        }}
                    >
                        <div className={styles.fileUpload__text}>Загрузить с Unsplash</div>
                        <img className={styles.fileUpload__icon} src='/src/assets/images/unsplash.svg' width={'13px'} style={{
                            filter: 'invert(1)'
                        }} />
                    </div>
                </>
            )
        }

        const renderImageUploaded = () => {
            return (
                <div className={styles.imageField__imageUploaded}>
                    <div className={styles.imageUploaded__imageActions}>
                        <div className={styles.imageActions__replace} onClick={handleFileInputClick}>
                            Изменить
                        </div>
                        <input
                            type="file"
                            accept='.jpg, .png, .svg, .jpeg'
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <div className={styles.imageActions__delete} onClick={handleBgImageDelete}>
                            Удалить
                        </div>

                        <div className={styles.imageActions__overlay} />
                    </div>

                    <div
                        className={styles.imageUploaded__image}
                        style={{
                            backgroundImage: `url(${currentSlide.background.type == 'image' ? currentSlide.background.src : 'none'})`,
                        }}
                    />

                </div >
            )
        }

        return (
            <div className={styles.backgroudSettings__imageField}>
                {
                    isImageUploaded
                        ? renderImageUploaded()
                        : renderUploadButton()
                }
            </div>
        )
    }

    return (
        <>
            <div className={styles.properties} id="properties">
                <div className={styles.slideid}>
                    <p>Слайд {currentSlideIndex + 1}</p>
                </div>

                <div className={styles.divider} />

                <div className={styles.backgroudSettings}>
                    <div className={styles.backgroudSettings__title}>Фон</div>
                    <div className={styles.backgroudSettings__bgType}>
                        <div className={`${styles.bgType__item} ${bgType == 'color' ? '' : styles.bgType__item_inactive}`} onClick={() => {
                            if (bgType !== 'color') {
                                setBgType('color')
                            }
                        }}>
                            <p>Цвет</p>
                        </div>
                        <div className={`${styles.bgType__item} ${bgType == 'image' ? '' : styles.bgType__item_inactive}`} onClick={() => {
                            if (bgType !== 'image') {
                                setBgType('image')
                            }
                        }}>
                            <p>Изображение</p>
                        </div>
                        <div
                            className={styles.bgType__active}
                            style={{
                                right: bgType == 'color' ? '107px' : '13px'
                            }}
                        ></div>
                    </div>

                    {
                        bgType == 'color'
                            ? renderColorField()
                            : renderImageField()
                    }
                </div>
            </div>


            {unsplashUploadToBgActive ? (<UnsplashUploadMenu currentSlideId={currentSlide?.id || '1'} setUnsplashUploadActive={setUnsplashUploadToBgActive} source='changeBackground' />) : ''}
        </>
    )
}


function TextSelected({ textId }: { textId: string }) {
    const slideList = useSelector((state: RootState) => state.presentation.slideList)
    const selectedSlides = useSelector((state: RootState) => state.presentation.selection.slides)
    const dispatch = createDispatch(store)
    const currentSlide = slideList.find(slide => slide.id == selectedSlides[selectedSlides.length - 1])
    const currentSlideId = currentSlide ? currentSlide.id : '0'

    const [isFontSelectionActive, setIsFontSelectionActive] = useState(false)
    const [isWeightSelectionActive, setIsWeightSelectionActive] = useState(false)
    const [isSizeSelectionActive, setIsSizeSelectionActive] = useState(false)
    const [textSize, setTextSize] = useState(0)
    const [colorValue, setColorValue] = useState('')
    useEffect(() => {
        if (!currentSlide) return
        const selectedText = currentSlide.objects.find(obj => obj.id === textId)
        if (selectedText?.type === 'text') {
            setColorValue(selectedText.font.color.toUpperCase())
        }
    }, [currentSlide, textId])

    const fontSelectionRef = useRef<HTMLDivElement>(null)
    const fontSelectionMenuRef = useRef<HTMLDivElement>(null)
    const weightSelectionRef = useRef<HTMLDivElement>(null)
    const weightSelectionMenuRef = useRef<HTMLDivElement>(null)
    const sizeSelectionRef = useRef<HTMLDivElement>(null)
    const sizeSelectionMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutsideFontSelection(event: MouseEvent) {
            if (fontSelectionMenuRef.current &&
                !fontSelectionMenuRef.current.contains(event.target as Node) &&
                !fontSelectionRef.current?.contains(event.target as Node)) {
                setIsFontSelectionActive(false)
            }
        }

        if (isFontSelectionActive) {
            document.addEventListener('mousedown', handleClickOutsideFontSelection)
        }

        function handleClickOutsideWeightSelection(event: MouseEvent) {
            if (weightSelectionMenuRef.current &&
                !weightSelectionMenuRef.current.contains(event.target as Node) &&
                !weightSelectionRef.current?.contains(event.target as Node)) {
                setIsWeightSelectionActive(false)
            }
        }

        if (isWeightSelectionActive) {
            document.addEventListener('mousedown', handleClickOutsideWeightSelection)
        }

        function handleClickOutsideSizeSelection(event: MouseEvent) {
            if (sizeSelectionMenuRef.current &&
                !sizeSelectionMenuRef.current.contains(event.target as Node) &&
                !sizeSelectionRef.current?.contains(event.target as Node)) {
                setIsSizeSelectionActive(false)
            }
        }

        if (isSizeSelectionActive) {
            document.addEventListener('mousedown', handleClickOutsideSizeSelection)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideFontSelection)
            document.removeEventListener('mousedown', handleClickOutsideWeightSelection)
            document.removeEventListener('mousedown', handleClickOutsideSizeSelection)
        }
    }, [isFontSelectionActive, isWeightSelectionActive, isSizeSelectionActive])

    useEffect(() => {
        if (!currentSlide) return
        const selectedText = currentSlide.objects.find(obj => obj.id === textId)
        if (selectedText?.type === 'text') {
            setTextSize(selectedText.font.size)
            setColorValue(selectedText.font.color.slice(1).toUpperCase())
        }
    }, [currentSlide, textId])

    if (!currentSlide) return null
    const selectedText = currentSlide.objects.find(obj => obj.id === textId)
    if (!selectedText || selectedText.type !== 'text') return null

    function handleClickOnFontSelection() {
        setIsFontSelectionActive(!isFontSelectionActive)
    }

    function handleClickOnWeightSelection() {
        setIsWeightSelectionActive(!isWeightSelectionActive)
    }

    function handleClickOnSizeSelection() {
        setIsSizeSelectionActive(!isSizeSelectionActive)
    }

    const getSelectedFontIndicatorTop = (fontFamily: string) => {
        const fonts = ['Inter', 'Geologica', 'JetBrains Mono', 'Montserrat', 'Open Sans', 'Roboto Flex', 'Alumni Sans', 'Unbounded']
        const fontIndex = fonts.findIndex(font => font == fontFamily)
        return fontIndex * 28 + 43
    }

    const getSelectedWeightIndicatorTop = (weight: number) => {
        switch (weight) {
            case 100:
                return 8
            case 200:
                return 32
            case 300:
                return 56
            case 400:
                return 80
            case 500:
                return 104
            case 600:
                return 128
            case 700:
                return 152
            case 800:
                return 176
            case 900:
                return 200
            default:
                return 8
        }
    }

    const getSelectedSizeIndicatorTop = (size: number) => {
        switch (size) {
            case 10:
                return 8
            case 12:
                return 32
            case 14:
                return 56
            case 16:
                return 80
            case 20:
                return 104
            case 24:
                return 128
            case 32:
                return 152
            case 36:
                return 176
            case 40:
                return 200
            case 48:
                return 224
            case 64:
                return 248
            case 96:
                return 272
            case 128:
                return 296

            default:
                return -1
        }
    }

    const handleChangeFontFamily = (fontFamily: string) => {
        if (selectedText.font.fontFamily !== fontFamily) {
            dispatch(setFontFamily(currentSlideId, selectedText.id, fontFamily))
        }
        setIsFontSelectionActive(false)
    }

    const getWeightAsWord = (weight: number) => {
        switch (weight) {
            case 100:
                return 'Thin'
            case 200:
                return 'Extra Light'
            case 300:
                return 'Light'
            case 400:
                return 'Regular'
            case 500:
                return 'Medium'
            case 600:
                return 'Semi Bold'
            case 700:
                return 'Bold'
            case 800:
                return 'Extra Bold'
            case 900:
                return 'Black'
        }
    }

    const handleChangeFontWeight = (fontWeight: number) => {
        if (selectedText.font.weight !== fontWeight) {
            dispatch(setFontWeight(currentSlideId, selectedText.id, fontWeight))
        }
        setIsWeightSelectionActive(false)
    }

    const handleChangeFontSize = (fontSize: number) => {
        if (selectedText.font.size !== fontSize) {
            dispatch(setFontSize(currentSlideId, selectedText.id, fontSize))
        }
        setIsSizeSelectionActive(false)
    }

    const handleChangeFontSizeInInputOnBlur = () => {
        let newSize = Number(textSize)

        if (isNaN(newSize) || newSize < 1) {
            newSize = 1
        } else if (newSize > 999) {
            newSize = 999
        }

        setTextSize(newSize)
        if (newSize !== selectedText.font.size) {
            dispatch(setFontSize(currentSlideId, selectedText.id, newSize))
        }
    }

    const handleChangeFontSizeInInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^0-9]/g, '')
        setTextSize(Number(value))
    }

    function isValidColor(value: string) {
        const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return pattern.test(value)
    }

    const onColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        setColorValue(newValue.slice(1).toUpperCase())
    }

    const onColorBlur = () => {
        const newColor = `#${colorValue}`
        if (isValidColor(newColor)) {
            dispatch(setFontColor(currentSlideId, selectedText.id, newColor))
        }
    }

    const onColorTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value.toUpperCase()
        setColorValue(newValue)
    }

    const onColorTextBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.toUpperCase()
        const newValue = '#' + inputValue
        if (isValidColor(newValue)) {
            dispatch(setFontColor(currentSlideId, selectedText.id, newValue))
        }
    }
    return (
        <div className={styles.properties} id="properties">
            <div className={styles.properties__title}>Текст</div>
            <div className={styles.divider} />

            <div className={styles.fontSettings}>
                <div
                    className={styles.fontSettings__font_family}
                    ref={fontSelectionRef}
                    onMouseDown={handleClickOnFontSelection}
                >
                    <div className={styles.font_family__title}>Шрифт</div>
                    <div
                        className={`${styles.font_family__selection} ${isFontSelectionActive ? styles.font_family__menu_active : ''}`}
                    >
                        <div className={styles.ffselection__title}>{selectedText.font.fontFamily}</div>
                        <img className={styles.ffselection__icon} src='./src/assets/images/arrowdown.svg' />
                    </div>

                </div>

                <div
                    className={styles.fontSettings__font_weight}
                    ref={weightSelectionRef}
                    onMouseDown={handleClickOnWeightSelection}
                >
                    <div className={styles.font_weight__title}>Начертание</div>
                    <div
                        className={`${styles.font_weight__selection} ${isWeightSelectionActive ? styles.font_weight__menu_active : ''}`}
                    >
                        <div className={styles.fwselection__title}>{getWeightAsWord(selectedText.font.weight)}</div>
                        <img className={styles.fwselection__icon} src='./src/assets/images/arrowdown.svg' />
                    </div>

                </div>

                <div className={styles.fontSettings__font_size} >
                    <div className={styles.font_size__title}>Размер</div>
                    <div
                        className={`${styles.font_size__selection}`}
                    >
                        <div className={styles.font_size__selection__input}>
                            <input
                                className={styles.fsselection__title} type="text"
                                value={textSize}
                                onBlur={() => handleChangeFontSizeInInputOnBlur()}
                                onChange={(event) => handleChangeFontSizeInInput(event)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur()
                                    }
                                }}
                            />
                        </div>


                        <div
                            className={`${styles.font_size__selection__openmenu} ${isSizeSelectionActive ? styles.font_size__menu_active : ''}`}
                            ref={sizeSelectionRef}
                            onMouseDown={handleClickOnSizeSelection}
                        >
                            <img className={styles.fsselection__icon} src='./src/assets/images/arrowdown.svg' />
                        </div>
                    </div>
                </div>


                <div className={styles.color__title}>Цвет</div>
                <div className={styles.backgroudSettings__colorField}>
                    <div className={styles.color__container}>
                        <input
                            type='color'
                            className={styles.currentColor}
                            onChange={onColorChange}
                            onBlur={onColorBlur}
                            value={`#${colorValue}`}
                        />
                    </div>

                    <input
                        type="text"
                        className={styles.currentColorText}
                        value={colorValue}
                        placeholder='FFFFFF'
                        onBlur={onColorTextBlur}
                        onChange={onColorTextChange}
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = event.target.value.toUpperCase()
                            setColorValue(newValue)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur()
                            }
                        }}
                        maxLength={6}
                    />
                </div>
            </div>

            <div
                className={styles.fontSelection_menu}
                ref={fontSelectionMenuRef}
                style={{
                    opacity: isFontSelectionActive ? '1' : '0',
                    pointerEvents: isFontSelectionActive ? 'all' : 'none'
                }}
            >
                <div className={styles.font_selection_menu__title}>Шрифты</div>
                <div className={styles.font_selection_menu__list}>
                    <div
                        className={`${styles.font_selection__element} ${styles.font_inter} ${selectedText.font.fontFamily === 'Inter' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Inter')}
                    >
                        Inter
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_geologica} ${selectedText.font.fontFamily === 'Geologica' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Geologica')}
                    >
                        Geologica
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_jetbrains} ${selectedText.font.fontFamily === 'JetBrains Mono' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('JetBrains Mono')}
                    >
                        JetBrains Mono
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_montserrat} ${selectedText.font.fontFamily === 'Montserrat' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Montserrat')}
                    >
                        Montserrat
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_opensans} ${selectedText.font.fontFamily === 'Open Sans' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Open Sans')}
                    >
                        Open Sans
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_robotoflex} ${selectedText.font.fontFamily === 'Roboto Flex' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Roboto Flex')}
                    >
                        Roboto Flex
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_alumnisans} ${selectedText.font.fontFamily === 'Alumni Sans' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Alumni Sans')}
                    >
                        Alumni Sans
                    </div>

                    <div
                        className={`${styles.font_selection__element} ${styles.font_unbounded} ${selectedText.font.fontFamily === 'Unbounded' ? styles.font_selection__element_selected : ''}`}
                        onClick={() => handleChangeFontFamily('Unbounded')}
                    >
                        Unbounded
                    </div>

                    <div
                        className={styles.font_selection__selectionIndicator}
                        style={{
                            top: getSelectedFontIndicatorTop(selectedText.font.fontFamily)
                        }}
                    >
                        <img src='/src/assets/images/tick.svg' alt="" />
                    </div>
                </div>
            </div>

            <div
                className={styles.weightSelection_menu}
                ref={weightSelectionMenuRef}
                style={{
                    opacity: isWeightSelectionActive ? '1' : '0',
                    pointerEvents: isWeightSelectionActive ? 'all' : 'none'
                }}
            >
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(100)}>Thin</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(200)}>Extra Light</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(300)}>Light</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(400)}>Regular</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(500)}>Medium</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(600)}>Semi Bold</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(700)}>Bold</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(800)}>Extra Bold</div>
                <div className={styles.weight_selection__element} onClick={() => handleChangeFontWeight(900)}>Black</div>

                <div
                    className={styles.weightSelection__selectionIndicator}
                    style={{
                        top: getSelectedWeightIndicatorTop(selectedText.font.weight)
                    }}
                >
                    <img src='/src/assets/images/tick.svg' alt="" />
                </div>
            </div>

            <div
                className={styles.sizeSelection_menu}
                ref={sizeSelectionMenuRef}
                style={{
                    opacity: isSizeSelectionActive ? '1' : '0',
                    pointerEvents: isSizeSelectionActive ? 'all' : 'none'
                }}
            >
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(10)}>10</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(12)}>12</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(14)}>14</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(16)}>16</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(20)}>20</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(24)}>24</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(32)}>32</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(36)}>36</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(40)}>40</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(48)}>48</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(64)}>64</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(96)}>96</div>
                <div className={styles.size_selection__element} onClick={() => handleChangeFontSize(128)}>128</div>

                <div
                    className={styles.sizeSelection__selectionIndicator}
                    style={{
                        top: getSelectedSizeIndicatorTop(selectedText.font.size),
                        display: getSelectedSizeIndicatorTop(selectedText.font.size) == -1 ? 'none' : 'block'
                    }}
                >
                    <img src='/src/assets/images/tick.svg' alt="" />
                </div>
            </div>
        </div>
    )
}


function Properties() {
    const slideList = useSelector((state: RootState) => state.presentation.slideList)
    const selectedSlides = useSelector((state: RootState) => state.presentation.selection.slides)
    const currentSlide = slideList.find(slide => slide.id == selectedSlides[selectedSlides.length - 1])
    const selectedObjectId = useSelector((state: RootState) => state.presentation.selection.objects[0])
    const selectedObjectType = currentSlide?.objects.find(slide => slide.id === selectedObjectId)?.type

    if (currentSlide && selectedObjectId && selectedObjectType === 'text') {
        return (
            <TextSelected textId={selectedObjectId} />
        )
    } else {
        return (
            <SlideSelected />
        )
    }
}


export { Properties }
