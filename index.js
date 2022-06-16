const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
let animationId;
const friction = 0.99;
const score = document.querySelector('#score');
const btnStartGame = document.querySelector('#btnStartGame');
const modal = document.querySelector('#modal');
const finalScore = document.querySelector('#finalScore');
let pontos = 0;
canvas.width = innerWidth
canvas.height = innerHeight

//Jogador
class Player{
    constructor(x,y,radius,color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        context.beginPath();
        context.arc(this.x,this.y,this.radius, 0 , Math.PI * 2, false);
        context.fillStyle =  this.color
        context.fill();
    }
}

//Tiro
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        context.beginPath();
        context.arc(this.x,this.y,this.radius, 0 , Math.PI * 2, false);
        context.fillStyle =  this.color
        context.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

//inimigo
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        context.beginPath();
        context.arc(this.x,this.y,this.radius, 0 , Math.PI * 2, false);
        context.fillStyle =  this.color
        context.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

//Particulas
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x,this.y,this.radius, 0 , Math.PI * 2, false);
        context.fillStyle =  this.color
        context.fill();
        context.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(x, y, 10, 'white');
let projeteis = [];
let enemies = [];
let particulas = [];

function init(){
    player = new Player(x, y, 10, 'white');
    projeteis = [];
    enemies = [];
    particulas = [];
    pontos = 0;
    score.innerHTML = pontos;
    finalScore.innerHTML = pontos;
}

function spawnEnemies() {
    setInterval(()=>{
        const radius = Math.random() * (30 - 4) + 4;
        let x;
        let y;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x 
        )

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },1000);
}

function animate(){
    animationId = requestAnimationFrame(animate);
    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particulas.forEach((particula, particulaIndex)=>{
        if(particula.alpha <= 0){
            particulas.splice(particulaIndex, 1);
        }else{
            particula.update();
        }
    })

    projeteis.forEach((projetil, projetilIndex) => {
        projetil.update();
        //removendo os projeteis da tela
        if(projetil.x + projetil.radius < 0 || 
            projetil.x - projetil.radius > canvas.width || 
            projetil.y + projetil.radius < 0 ||
            projetil.y - projetil.radius > canvas.height){
            setTimeout(()=>{
                projeteis.splice(projetilIndex, 1);
            },0)
        }
    })

    enemies.forEach((inimigo, index)=>{
        inimigo.update();

        const distanciaPlayer = Math.hypot(player.x - inimigo.x, player.y - inimigo.y)//verifica a distancia entre o player e o inimigo
        //GameOver
        if(distanciaPlayer - inimigo.radius - player.radius < 1){
            //console.log("Fim de Jogo");
            cancelAnimationFrame(animationId);
            modal.style.display = "flex";
            finalScore.innerHTML = pontos;
        }

        projeteis.forEach((projetil, projetilIndex) => {
            const distancia = Math.hypot(projetil.x - inimigo.x, projetil.y - inimigo.y)//verifica a distancia entre o tiro e o inimigo
            
            // quando o projetil tocar no inimigo
            if(distancia - inimigo.radius - projetil.radius < 1){             

                //animação de particulas ao hitar o inimigo
                for(let i = 0; i < inimigo.radius; i ++){
                    particulas.push(new Particle(projetil.x, projetil.y, Math.random() * 2, inimigo.color, {x: Math.random() - 0.5 * (Math.random() * 6), y: Math.random() - 0.5 * (Math.random() * 6)}));
                }
                //se o inimigo for grande ele diminui de tamanho
                if(inimigo.radius - 10 > 5){
                    //aumenta a pontuação
                    pontos += 100;
                    score.innerHTML = pontos;
                    gsap.to(inimigo, {
                        radius: inimigo.radius - 10
                    });
                    setTimeout(()=>{
                        projeteis.splice(projetilIndex, 1);
                    },0)
                }else{//caso contrario remove da cena completamente
                    //aumenta a pontuação
                    pontos += 250;
                    score.innerHTML = pontos;
                    setTimeout(()=>{
                        enemies.splice(index, 1);
                        projeteis.splice(projetilIndex, 1);
                        //console.log("Remove o inimigo");
                    },0)
                }
            }
        });
    })
}

//Eventos ao tocar na tela
addEventListener('click',(event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    console.log(angle)
    projeteis.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
        )
    )
});

btnStartGame.addEventListener('click',()=>{
    init();
    animate();
    spawnEnemies();
    modal.style.display = "none";
});