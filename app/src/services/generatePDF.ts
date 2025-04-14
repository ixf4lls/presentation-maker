import { Slide } from "../../../types"

type PdfOptions = {
    margin: number,
    filename: string,
    image: { type: string, quality: number },
    html2canvas: {
        scale: number,
        useCORS: boolean,
        letterRendering: boolean,
        logging: boolean,
    },
    jsPDF: {
        unit: string,
        format: number[],
        orientation: string,
    },
}

type Html2PdfWorker = {
    set: (options: PdfOptions) => Html2PdfWorker,
    from: (element: HTMLElement) => Html2PdfWorker,
    output: (type: 'blob') => Promise<Blob>,
}

type Html2PdfFactory = () => Html2PdfWorker

declare const html2pdf: Html2PdfFactory

const createSlideHTML = (slide: Slide, isLast: boolean): HTMLDivElement => {
    const slideDiv = document.createElement('div')
    slideDiv.className = 'pdf-slide'
    slideDiv.style.cssText = `    
        position: relative;
        ${isLast ? '' : 'page-break-after: always;'}        
    `

    switch (slide.background.type) {
        case 'color': {
            const backgroundDiv = document.createElement('div')
            backgroundDiv.style.cssText = `
                background-color: ${slide.background.value};
                width: 1920px;
                height: 1080px;
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
            `
            slideDiv.appendChild(backgroundDiv)
            break
        }

        case 'image': {
            const backgroundImg = document.createElement('img')
            backgroundImg.src = slide.background.src
            backgroundImg.style.cssText = `
                width: 1920px;
                height: 1080px;
                object-fit: cover;
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
            `
            slideDiv.appendChild(backgroundImg)
            break
        }

        case 'gradient': {
            const backgroundGradientDiv = document.createElement('div')
            const colors = slide.background.colors.map((color) => {
                return `${color.color} ${color.position}%`
            }).join(', ')
            backgroundGradientDiv.style.cssText = `
                background: linear-gradient(${slide.background.direction}deg, ${colors});
                width: 1920px;
                height: 1080px;
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
            `
            slideDiv.appendChild(backgroundGradientDiv)
            break
        }
    }

    slide.objects.forEach(obj => {
        const element = document.createElement('div')
        element.style.cssText = `
            position: absolute;
            left: ${obj.position.x - obj.size.w / 2}px;
            top: ${obj.position.y - obj.size.h / 2}px;
            text-wrap: wrap
        `

        if (obj.type === 'text') {
            element.style.cssText += `
                width: ${obj.size.w}px;
                height: ${obj.size.h}px;
                color: ${obj.font.color};
                font-family: '${obj.font.fontFamily}';
                font-size: ${obj.font.size}px;
                font-weight: ${obj.font.weight};
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow-wrap: break-word;
            `
            element.textContent = obj.value
        } else if (obj.type === 'image') {
            const img = document.createElement('img')
            img.src = obj.src
            img.style.cssText = `
                width: ${obj.size.w}px;
                height: ${obj.size.h}px;
                object-fit: contain;
            `
            element.appendChild(img)
        }

        slideDiv.appendChild(element)
    })

    return slideDiv
}

export const generatePDF = async (slideList: Slide[], title: string): Promise<Blob | null> => {
    try {
        const container = document.createElement('div')
        container.style.cssText = `
            width: 1920px;
            height: ${1080 * slideList.length}px;
        `
        const style = document.createElement('style')
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Alumni+Sans:ital,wght@0,100..900;1,100..900&family=Geologica:wght@100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto+Flex:opsz,wght@8..144,100..1000&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Unbounded:wght@200..900&display=swap');`
        container.appendChild(style)
        slideList.forEach(slide => {
            container.appendChild(createSlideHTML(slide, slide === slideList[slideList.length - 1]))
        })

        document.body.appendChild(container)

        await document.fonts.ready

        const opt = {
            margin: 0,
            filename: `${title || 'presentation'}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'px',
                format: [1920, 1080],
                orientation: 'landscape',
            }
        }

        const pdf = await html2pdf().set(opt).from(container).output('blob')
        // await html2pdf().set(opt).from(container).save();

        document.body.removeChild(container)
        return pdf

    } catch (error) {
        console.error('Ошибка при генерации PDF:', error)
        return null
    }
}
