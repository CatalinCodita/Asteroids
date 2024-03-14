const canvas =  document.querySelector('canvas')
const c = canvas.getContext('2d')
let animationID

canvas.width = window.innerWidth
canvas.height = window.innerHeight


function animate(){
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height) 
    animationID = requestAnimationFrame(animate)
}


// Aici creeezi modelul jucatorului 
class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.rotation = 0
        
    }
    draw() {
        c.save()
        
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        
        c.beginPath()
        c.arc(this.position.x, this.position.y, 5, 0, Math.PI *2, false)
        c.fillStyle = 'DarkMagenta'
        c.fill()
        c.closePath()
        
        c.beginPath()
        c.moveTo(this.position.x + 30, this.position.y)
        c.lineTo(this.position.x - 10, this.position.y - 10)
        c.lineTo(this.position.x - 10, this.position.y + 10)
        c.closePath()

        c.strokeStyle = 'white'
        c.stroke()
        c.restore()
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
          {
            x: this.position.x + cos * 30 - sin * 0,
            y: this.position.y + sin * 30 + cos * 0,
          },
          {
            x: this.position.x + cos * -10 - sin * 10,
            y: this.position.y + sin * -10 + cos * 10,
          },
          {
            x: this.position.x + cos * -10 - sin * -10,
            y: this.position.y + sin * -10 + cos * -10,
          },
        ]
      }
}

// Aici creezi modelul proiectilelor pe care le trage nava si viteza lor
class Projectiles {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 5
    }
    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}
// Aici ai forma asteroizilor, viteza cu care se deplaseaza, marimea
class Asteroid {
    constructor({position, velocity, radius}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
    }
    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.closePath()
        c.strokeStyle = 'white'
        c.stroke()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}
// Aici jucatorul este pus in mijlocul ecranului
const player = new Player({
    position: {x: canvas.width /2, y: canvas.height /2},
    velocity:{x: 0, y: 0},
    })
     
 
// controalele
 const keys = {
    w: {
        pessed: false,
    },
    d: {
        pessed: false,
    },
    a: {
        pessed: false,
    },
    
 }
 // unitati de masura ca sa nu trebuiasca sa pui numere exacte peste tot
 //pt a evita buguri
    const speed = 3.5
    const rotational_speed = 0.03
    const friction = 0.97
    const projectiles = []
    const projectile_speed = 5
    const asteroids = []
// Aici sunt limitele ecranului ca asteroizii sa fie stersi sa nu creeze lag
    const intervalID = window.setInterval (() => {
        const index = Math.floor(Math.random() * 4)
        let x, y
        let vx, vy
        let radius = 50 * Math.random() + 20 //marimea lor (Math.random alege un numar la intamplare si 20 este minimul)
        switch (index) {
            case 0:
                x = 0 - radius
                y = Math.random() * canvas.height
                vx = 1
                vy = 0
            break
            case 1:
                x = Math.random() * canvas.width
                y = canvas.height + radius
                vx = 0
                vy = -1
            break
            case 2:
                x = canvas.width + radius
                y = Math.random() * canvas.height
                vx = -1
                vy = 0
            break
            case 3:
                x = Math.random() * canvas.width
                y = 0 - radius
                vx = 0
                vy = 1
            break
        }
// generarea de noi asteroizi
        asteroids.push(
            new Asteroid ({
                position: {
                    x: x,
                    y: y,
                },
                velocity: {
                    x: vx,
                    y: vy,
                },
                radius,
            })
        )
    }, 3000) // intervalul de timp dintre ei in milisecunde
// Asa inregistreaza calculatorul coliziunea intre asteroid si proiectil (nu distruge)
  
 

    function circleCollision(circle1, circle2) {
        const xDifference = circle2.position.x - circle1.position.x
        const yDifference = circle2.position.y - circle1.position.y
        const distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference)
        if (distance <= circle1.radius + circle2.radius) {
            return true
        }
        return false 
    }
    
    function circleTriangleCollision(circle, triangle) {
        // Check if the circle is colliding with any of the triangle's edges
        for (let i = 0; i < 3; i++) {
          let start = triangle[i]
          let end = triangle[(i + 1) % 3]
      
          let dx = end.x - start.x
          let dy = end.y - start.y
          let length = Math.sqrt(dx * dx + dy * dy)
      
          let dot =
            ((circle.position.x - start.x) * dx +
              (circle.position.y - start.y) * dy) /
            Math.pow(length, 2)
      
          let closestX = start.x + dot * dx
          let closestY = start.y + dot * dy
      
          if (!isPointOnLineSegment(closestX, closestY, start, end)) {
            closestX = closestX < start.x ? start.x : end.x
            closestY = closestY < start.y ? start.y : end.y
          }
      
          dx = closestX - circle.position.x
          dy = closestY - circle.position.y
      
          let distance = Math.sqrt(dx * dx + dy * dy)
      
          if (distance <= circle.radius) {
            return true
          }
        }
      
        // No collision
        return false
      }
      
      function isPointOnLineSegment(x, y, start, end) {
        return (
          x >= Math.min(start.x, end.x) &&
          x <= Math.max(start.x, end.x) &&
          y >= Math.min(start.y, end.y) &&
          y <= Math.max(start.y, end.y)
        )
      }
 
 function animate() {
    const animationID = window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
   
    player.update() 
    
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles [i]
        projectile.update()


        // Aici sunt limitele ecranului pt proiectile ca sa nu fie lag
        if (projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y - projectile.radius > canvas.height ||
            projectile.position.y + projectile.radius < 0
            ){
            projectiles.splice(i, 1)
        }
    }
    // Aici distruge
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids [i]
        asteroid.update()

        if (circleTriangleCollision(asteroid, player.getVertices())) {
            c.fillStyle = 'white'
            c.font = 'bold 40px "gameovecre1", sans-serif'
            c.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height /2)
            window.cancelAnimationFrame(animationID)
            clearInterval(intervalID)
            //console.log('GAME OVER')
        }

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles [j]

            if (circleCollision(asteroid, projectile)){
                asteroids.splice(i, 1)
                projectiles.splice(j, 1)
            }
        }
        if (asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
            ){
            asteroids.splice(i, 1)
        }
        
    }
// controale
    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * speed
        player.velocity.y = Math.sin(player.rotation) * speed
    //else player.velocity.x = 0
    } else if (!keys.w.pessed) {
        player.velocity.x *= friction
        player.velocity.y *= friction
    }
    if (keys.d.pressed) player.rotation += rotational_speed
    else if (keys.a.pressed) player.rotation -= rotational_speed
    //else player.rotation = 0
 }
 
 animate()
//cand apesi butonul
 window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = true           
            break
        case 'KeyD':
            keys.d.pressed = true            
            break    
        case 'KeyA':
            keys.a.pressed = true
            break   
        case 'ArrowUp':
            projectiles.push(new Projectiles({
                position: {
                   x: player.position.x + Math.cos(player.rotation) * 30,
                   y: player.position.y + Math.sin(player.rotation) * 30, 
                },
                velocity: {
                    x: Math.cos(player.rotation) * projectile_speed,
                    y: Math.sin(player.rotation) * projectile_speed,
                },
            }))

            
            break

    }

 })
 // cand nu mai apesi butonul 
 window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false           
            break
        case 'KeyD':
            keys.d.pressed = false           
            break    
        case 'KeyA':
            keys.a.pressed = false
            break        
    }
    
 })