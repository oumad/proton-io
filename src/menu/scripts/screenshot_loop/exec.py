import os
import sys
import subprocess
import time

def main(script,monitor,screens,interval,outName,incTime,incDate,outDir,myFormat) :

    scriptDir = os.path.dirname(__file__)
    magickPath = os.path.join(scriptDir,'..','..','libs','magick.exe')
    magickPath = os.path.realpath(magickPath)
    monitorScr = "screenshot:[{}]".format(monitor)

    i = 0

    while i < int(screens) :
        currentName = []
        #constructing the begining of the arguments
        args = [magickPath,"convert",monitorScr]
        currentName.append(outName)

        #check if date and time are requested
        if incTime != "false":
            currentTime = time.strftime("%H_%M_%S", time.gmtime())
            currentName.append("-{}".format(currentTime))
            print (currentTime)
        if incDate != "false":
            currentDate = time.strftime("%Y_%m_%d", time.gmtime())
            currentName.append("-{}".format(currentDate))
            print (currentDate)

        #finalizing file name construction
        currentName.append(".{}".format(myFormat))
        currentName = ''.join(currentName)
        outputScr = os.path.join(outDir,currentName)


        args.extend([outputScr])
        print (args)
        subprocess.Popen(args)
        #incrementing the number of repetitions
        i = i + 1
        #sleep and till the next interval
        time.sleep(float(interval))






if __name__ == '__main__':

            print (sys.argv)
            main(*sys.argv)
            """
            try:
                print (sys.argv)
                main(*sys.argv)
                #raw_input("Press ENTER to exit")
            except:
                print sys.exc_info()[0]
                import traceback
                print traceback.format_exc()
                print "Press Enter to continue ..."
                raw_input("Press ENTER to exit")
            """
