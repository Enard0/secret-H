import { useEffect } from "react"
import Back from "../assets/policy/back.png"

const DiscardPile = ({ _size=0}) => {
    const self = useRef()
    useEffect(() => {
        addimg(_size)
    }, [])
    
    useEffect(() => {
        let oldsize = self.current.childElementCount;
        if(_size> oldsize){
            addimg(_size-oldsize);
        }else{
            while(self.current.childElementCount>_size){
                self.current.removeChild(self.current.lastElementChild);
            }
        }
    },[_size])

    const notmaldis = (min,max, probing) => {
        let out = min-1;
        let step = (max-min+1)/probing;
        for(let i=0; i<probing; i++){
            out+=Math.random()*step
        }
        return out
    }
    const addimg = (n) =>{
        for(let i=0; i<n; i++){
            if(n == 1 && self.current.childElementCount>=10){
                self.current.appendChild(self.current.children[Math.round(Math.abs(notmaldis(-5,5,3)))]);
                continue;
            }
            var img = document.createElement('img');
            img.src = Back;
            let rot =0;
            const probe = 5;
            if(Math.random()>0.5){
                rot = notmaldis(-90,90,probe)
            }else{
                rot = notmaldis(90,270,probe)
            }

            if(rot<22.5){
                img.style.boxShadow = "-1px 1px 1px #000"; //D
            }else if(rot<67.5){ 
                img.style.boxShadow = "0px 1px 1px #000";
            }else if(rot<112.5){
                img.style.boxShadow = "1px 1px 1px #000"; //D
            }else if(rot<157.5){
                img.style.boxShadow = "1px 0px 1px #000";
            }else if(rot<202.5){
                img.style.boxShadow = "1px -1px 1px #000"; //D
            }else if(rot<247.5){
                img.style.boxShadow = "0px -1px 1px #000";
            }else if(rot<292.5){
                img.style.boxShadow = "-1px -1px 1px #000"; //D
            }else if(rot<337.5){
                img.style.boxShadow = "-1px 0px 1px #000";
            }else{
                img.style.boxShadow = "-1px 1px 1px #000"; //D
            }
            img.style.transform = `translate(-50%,-50%) translate(${notmaldis(-15,15,probe)}px, ${notmaldis(-15,15,probe)}px) rotate(${rot}deg)`;
            self.current.appendChild(img)
        }
    }

    return (
        <div className={`discard-pile`} ref={self}>
        </div>
    );
}

export default DiscardPile