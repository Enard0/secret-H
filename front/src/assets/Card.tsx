import './Card.css'
import Lib from '/cards/LiberalC.png'
import Fas from '/cards/FascistC.png'
import Com from '/cards/CommunistC.png'

type Props = {
    type: string;
};

const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text', event.currentTarget.id);
    event.currentTarget.style.opacity = "0.1"
}


const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.style.opacity = "1"
}

function Card(props: Props) {
    var img = Lib
    switch (props.type) {
        case 'L':
            var img = Lib
            break;
        case 'F':
            var img = Fas
            break
        case 'C':
            var img = Com
            break
    }
    return (
        <>
            <div id={props.type} className='card' draggable="true" onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <img src={img} />
            </div>
        </>
    )
}

export default Card
