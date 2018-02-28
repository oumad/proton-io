def main(script,mySel,mySearch,myReplace) :
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
            main(*sys.argv)