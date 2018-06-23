#python 2.7
#Script to create a project based on a given template
import os
import shutil
import sys

def patternRename(script, dir, pattern, titlePattern):
    for pathAndFilename in glob.iglob(os.path.join(dir, pattern)):
        title, ext = os.path.splitext(os.path.basename(pathAndFilename))
        os.rename(pathAndFilename,
                  os.path.join(dir, titlePattern % title + ext))




if __name__ == '__main__':
            #print sys.argv
            patternRename(*sys.argv)

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
