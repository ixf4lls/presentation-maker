import { useCallback, useEffect, useState } from 'react'
import styles from '../assets/styles/UnsplashUploadMenu.module.css'
import { createApi } from 'unsplash-js'
import createDispatch from '../store/utils/createDispatch'
import store from '../store'
import { changeBackground, createImage } from '../store/actions/presentationActions'
import { getImageDimensions } from '../services/getImageDimensions'
import { Loader } from './Loader'

type UnsplashPhoto = {
    id: string,
    urls: {
        full: string,
        small: string,
    },
}

type UnsplashUploadMenuProps = {
    currentSlideId: string,
    setUnsplashUploadActive: (unsplashUploadActive: boolean) => void,
    source: 'createImage' | 'changeBackground'
}

const unsplashAccessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY?.trim()
const unsplash = unsplashAccessKey ? createApi({ accessKey: unsplashAccessKey }) : null

function UnsplashUploadMenu({ currentSlideId, setUnsplashUploadActive, source }: UnsplashUploadMenuProps) {
    useEffect(() => {
        function handleClose(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setUnsplashUploadActive(false)
            }
        }

        document.addEventListener('keydown', handleClose)

        return () => {
            document.removeEventListener('keydown', handleClose)
        }
    }, [setUnsplashUploadActive])

    const handleCreateImage = async (src: string) => {
        const dimensions = await getImageDimensions(src)
        const aspectRatio = dimensions.w / dimensions.h
        const pos = { x: dimensions.w / 2, y: dimensions.h / 2 }

        dispatch(createImage(currentSlideId, src, { height: dimensions.h, width: dimensions.w, aspectRatio: aspectRatio }, pos))
        setUnsplashUploadActive(false)
    }

    const handleSetImageAsBackground = (src: string) => {
        dispatch(changeBackground(currentSlideId, { type: 'image', src: src }))
        setUnsplashUploadActive(false)
    }

    const dispatch = createDispatch(store)
    const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
    const [page, setPage] = useState(1)
    const [query, setQuery] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const imagesFromUnsplash = useCallback(async () => {
        if (!query) {
            setPhotos([])
            setError(null)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            if (!unsplash) {
                setError('Unsplash API key не настроен. Укажите VITE_UNSPLASH_ACCESS_KEY в app/.env')
                setPhotos([])
                return
            }

            const result = await unsplash.search.getPhotos({
                query,
                page,
                perPage: 24
            })

            if (result.type === 'success') {
                setPhotos(result.response.results)
            } else {
                setError('Не удалось загрузить изображения')
            }
        } catch (err) {
            setError('Ошибка при загрузке изображений')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [page, query])

    useEffect(() => {
        imagesFromUnsplash()
    }, [page, imagesFromUnsplash])

    return (
        <div className={styles.unsplashUpload}>
            <div
                className={styles.menu}
                style={{
                    height: query == '' ? '80px' : '810px',
                    width: query == '' ? '250px' : '1440px'
                }}
            >
                <div className={styles.title}>unsplash.com</div>
                <div className={styles.menu__search}>
                    <input
                        type='text'
                        placeholder='Введите запрос'
                        className={styles.search__input}
                        defaultValue={query}
                        onBlur={(event) => {
                            setQuery(event.target.value.trim())
                            setPage(1)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur()
                            }
                        }}
                    />
                </div>

                <div
                    className={styles.divider}
                    style={{
                        display: query == '' ? 'none' : 'block'
                    }}
                />
                {error && <div className={styles.error} role='alert'>{error}</div>}
                <div className={styles.menu__images}>
                    {isLoading
                        ? (
                            <div className={styles.loaderContainer}>
                                <Loader />
                            </div>
                        )

                        : <div
                            className={styles.imageGrid}
                            style={{
                                height: query == '' ? '0px' : '716px'
                            }}
                        >
                            {photos.map(photo => (
                                <div
                                    key={photo.id}
                                    className={styles.imageItem}
                                    onClick={() => source === 'createImage'
                                        ? handleCreateImage(photo.urls.full)
                                        : handleSetImageAsBackground(photo.urls.full)}
                                >
                                    <img src={photo.urls.small} alt="" className={styles.image} />
                                </div>
                            ))}

                            <div
                                className={styles.pages}
                                style={
                                    photos.length > 0
                                        ? { display: 'flex' }
                                        : { display: 'none' }
                                }
                            >
                                <div className={styles.page_title}>Страница</div>
                                <div className={styles.page_contol}>
                                    <div className={styles.previous_page} onClick={() => setPage(Math.max(1, page - 1))}>
                                        <img src='/src/assets/images/chevron-left.svg' alt="" />
                                    </div>
                                    <div className={styles.current_page}>{page}</div>
                                    <div className={styles.next_page} onClick={() => setPage(page + 1)}>
                                        <img src='/src/assets/images/chevron-right.svg' alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                </div>
            </div>

            <div className={styles.overlay} onClick={() => setUnsplashUploadActive(false)} />
        </div>
    )
}

export { UnsplashUploadMenu }
