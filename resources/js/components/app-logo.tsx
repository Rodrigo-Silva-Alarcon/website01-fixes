import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#191c1f] text-white">
                <AppLogoIcon variant="icon" className="size-5 fill-current text-white" />
            </div>
        </>
    );
}
