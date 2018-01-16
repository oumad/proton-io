def main(script,myDir,mySel,mySearch,myReplace) :
    print (mySel,mySearch,myReplace)
    mySel = open(mySel,"r")
    mySel = mySel.read().split(',')
    #print mySel
    for fileName in mySel:
        myDirname = os.path.dirname(fileName)
        myBaseName = os.path.basename(fileName)
        newBasename = myBaseName.replace(mySearch, myReplace)
        newFileName = os.path.join(myDirname,newBasename)
        os.rename(fileName,newFileName)
        print "{0} ===> {1}".format(myBaseName,newBasename)



if __name__ == '__main__':
            import os
            import sys
            import re
            #dir_path = os.path.dirname(os.path.realpath(__file__))
            #sys.path.append("{}/dependencies/python".format(dir_path))
            main(*sys.argv)
            """
            try:
                main(*sys.argv)
                #raw_input("Press ENTER to exit")
            except:
                print sys.exc_info()[0]
                import traceback
                print traceback.format_exc()
                print "Press Enter to continue ..."
                raw_input("Press ENTER to exit")
            """
