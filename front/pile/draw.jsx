import Back from "../assets/policy/back.png"

const DrawPile = ({ _size=0}) => {
    
    return (
        <div className={`draw-pile`}>
            <img src={Back} 
            style={{boxShadow: (()=>{
            let shadow = '-0.5px 0.5px 1px #000'
            for(let i=0; i<Math.min(10,_size);i++){
                shadow+=`, -${i*2}px ${i*2}px 1px rgba(0,0,0), -${i*2+1}px ${i*2+1}px 1px rgba(255,255,255)`
            }
            })()}}/>
        </div>
    );
}

export default DrawPile