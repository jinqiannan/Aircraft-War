/*
给每个敌机添加血量

*/
(function (){
    var home = document.getElementById('home'),
        optionArr = ['简单','一般','困难','难到爆'],
        timer = null;

    getHome()

    // 生成首页
    function getHome(){
        var title = document.createElement('h1');
        title.innerHTML = '飞机大战V0.1';
        home.appendChild(title)
        for(var i = 0; i < optionArr.length; i++){
            var div = document.createElement('div');
            div.className = 'select';
            div.i = i
            div.innerHTML = optionArr[i];
            home.appendChild(div);

            // 点击事件,点击不同的对象进入不同的环境
            div.onclick = function (ele){
                ele = ele || window.event
                createPlane(this.i,ele)
            }
        }
    }
    
    function createPlane (i,ele){
        home.innerHTML = ''
        var obj = createMyPlane(i,ele)
        createEnemy(i,obj)
        
    }
    // 生成自己的机器
    function createMyPlane (i,ele){
        /*再点击的时候获取鼠标坐标，与对应的坐标位置生成己方的飞机
          由i来决定是什么模式，ele来确定点击的鼠标坐标
        */
        var left = ele.clientX,
            top = ele.clientY,
            fatherTop = home.offsetTop,
            fatherLeft = home.offsetLeft,
            myPlane = document.createElement('img');
        myPlane.src = 'img/plane.png';
        myPlane.width = 60;
        myPlane.height = 36;
        myPlane.style.top = top - myPlane.height/2 - fatherTop + 'px';
        myPlane.style.left = left - myPlane.width/2 - fatherLeft + 'px';
        home.appendChild(myPlane)
        
        // 限定己方飞机的移动范围
        var maxTop = home.clientHeight - myPlane.height,
            maxLeft = home.clientWidth - myPlane.width;
        document.onmousemove = function (ele){ // 移动己方飞机
            ele = ele || window.event
            var newTop = ele.clientY - fatherTop - myPlane.height/2 ,
                newLeft = ele.clientX -fatherLeft - myPlane.width/2;
            newTop = Math.max(0,newTop);
            newTop = Math.min(newTop,maxTop);
            newLeft = Math.min(maxLeft,newLeft);
            newLeft = Math.max(0,newLeft);
            myPlane.style.top = newTop + 'px'
            myPlane.style.left = newLeft + 'px'
        }

        // 生成己方飞机的子弹 
        // 子弹定位，相对己方的飞机定位。子弹弹射的速度（不同的情况下子弹的弹射速度不同）
        createBullet = [300,200,100,50][i]
        shotBullet = [3,4,7,8][i]
        myPlane.bulletTimer = setInterval (function (){
            var bulletImg = document.createElement('img');
            bulletImg.className = 'bullet';
            bulletImg.src = 'img/bullet.png';
            bulletImg.width = 6;
            bulletImg.height = 22;
            //定位值应该在己方飞机的上面的中间，即应该是自己图片的top定位值减去己方飞机的高度，以及己方飞机的left值加上己方飞机宽度的一半再减去子弹自身宽度的一般
            bulletImg.style.top = myPlane.offsetTop - myPlane.clientHeight + 'px';
            bulletImg.style.left = myPlane.offsetLeft + myPlane.clientWidth/2 - bulletImg.width/2+ 'px'
            home.appendChild(bulletImg)
            bulletRun()
            function bulletRun (){
                bulletImg.style.top = bulletImg.offsetTop - shotBullet + 'px';
                if(bulletImg.offsetTop <= 0){
                    cancelAnimationFrame(bulletImg.bulletTimer)
                    home.removeChild(bulletImg)
                }else{
                    myPlane.parentNode && (bulletImg.bulletTimer = requestAnimationFrame(bulletRun))
                }
            }     
        },createBullet)

        return myPlane;
        
    }

    // 生成敌机
    function createEnemy(i,obj){
        createSpeed = [600,300,200,40]
        timer = setInterval(function(){
            var enemyImg = document.createElement('img');
            enemyImg.src = 'img/enemy.png';
            enemyImg.width = 23;
            enemyImg.height = 30;
            enemyImg.style.top = -enemyImg.height + 'px';
            enemyImg.style.left = Math.floor(Math.random() * (home.clientWidth - enemyImg.width + 1)) + 'px'; // 这里的left应该是再home的区域内[0,homeClientWidth - enemyImg.Clientwidth]
            home.appendChild(enemyImg)
            enemyImg.runspeed = Math.floor(Math.random() * 3 + 3) // 设置运动速度是【3，5】
            // 敌机是重上往下运动，所以敌机的top值是会改变的，并且运动速度应该不一样
            run()
            function run(){
                enemyImg.style.top = enemyImg.offsetTop + enemyImg.runspeed + 'px';
                if(enemyImg.offsetTop >= home.clientHeight){
                    home.removeChild(enemyImg)
                }else{
                    // 遍历子弹                                      
                    var bullets = document.getElementsByClassName('bullet');
                    for(var i = 0; i < bullets.length; i++){
                        // 判断是否碰撞
                        if( isCrush(bullets[i],enemyImg) ){ // 返回true则代表碰撞了.
                            // 如果子弹和敌机碰撞则清除敌机和子弹
                            cancelAnimationFrame(bullets[i].bulletTimer);
                            home.removeChild(bullets[i]);
                            boom(enemyImg,'')
                            home.removeChild(enemyImg);

                            return false;
                        }
                    }
                    
                    // 检测我军飞机和敌机是否碰撞
                    if(obj.parentNode && isCrush(obj,enemyImg)){
                        //返回为真则已经碰撞了，及此时我方的飞机的子弹和敌军的飞机不再生成，同时清除飞机的移动事件
                        document.onmousemove = null;
                        clearInterval(obj.bulletTimer)
                        clearInterval(timer)
                        boom(obj,2)
                        boom(enemyImg,'')
                        home.removeChild(obj);
                        home.removeChild(enemyImg);
                        return false;
                    }

                    obj.parentNode && requestAnimationFrame(run)
                }
            }
        },createSpeed[i])

    }

    /*当己方飞机，子弹以及敌机都生成后，我们需要将子弹，己方飞机，以及敌机的位置做一个监控，以方便销毁和子弹碰撞的敌机，或者当己方飞机毁掉后
    结束游戏，再清除定时器
    */

    // 爆炸效果 ene代表接受敌机对象
    function boom(ene,num){
    	var eneTop = ene.offsetTop,
    		eneLeft = ene.offsetLeft,
    		boomImg = document.createElement('img');
        boomImg.src = 'img/boom'+num+'.png';
        boomImg.width = 23;
        boomImg.height = 30;
        boomImg.style.top = eneTop + 'px';
        boomImg.style.left = eneLeft + 'px';
        home.appendChild(boomImg)

        setTimeout(function(){
            boomImg.parentNode && home.removeChild(boomImg);
            num && gameOver()
        },num ? 800 : 40)
    }

    // 检测碰撞 objBullent代表子弹，
    function isCrush (objBullent,foe){
        // 子弹的宽高范围
        var objBullentTop = objBullent.offsetTop,
            bullentBottom = objBullentTop + objBullent.height,
            objBullentLeft = objBullent.offsetLeft,
            objBullentRight = objBullentLeft + objBullent.width;

        // 敌机的范围
        var foeTop = foe.offsetTop,
            foeBottom = foeTop + foe.height,
            foeLeft = foe.offsetLeft,
            foeRight = foeLeft + foe.width;

        return !(objBullentTop > foeBottom || objBullentLeft > foeRight || bullentBottom < foeTop || objBullentRight < foeLeft)
    
    }

    // 游戏结束
    function gameOver (){
        home.innerHTML = "";
        var over = document.createElement("div"),
            txt = document.createElement('span');
        over.className = 'over';
        txt.innerHTML = '游戏结束';
        over.appendChild(txt)
        over.onclick = function (){
            home.innerHTML = '';
            getHome()
        }
        home.appendChild(over)
    }
}())